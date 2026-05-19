import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import dbConnect from "@/lib/db"
import Task from "@/models/Task"
import Habit from "@/models/Habit"
import Project from "@/models/Project"
import LifeDomain from "@/models/LifeDomain"
import Decision from "@/models/Decision"
import User from "@/models/User"
import webpush from "web-push"
import Groq from "groq-sdk"

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    "mailto:noreply@executiveos.app",
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  )
}

// Define tools
const tools = [
  {
    type: "function",
    function: {
      name: "getDailySummary",
      description: "Get a summary of the user's tasks, habits, and progress for today.",
      parameters: { type: "object", properties: {} }
    }
  },
  {
    type: "function",
    function: {
      name: "rescheduleTask",
      description: "Reschedule an overdue or pending task to a new date.",
      parameters: {
        type: "object",
        properties: {
          taskId: { type: "string", description: "The ID of the task" },
          newDate: { type: "string", description: "The new date in ISO format" }
        },
        required: ["taskId", "newDate"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "sendStrictWarning",
      description: "Send a push notification warning to the user.",
      parameters: {
        type: "object",
        properties: {
          message: { type: "string", description: "The warning message" }
        },
        required: ["message"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "createTask",
      description: "Create a new task for the user.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string" },
          description: { type: "string" },
          dueDate: { type: "string", description: "ISO date string" },
          priority: { type: "string", enum: ["low", "medium", "high"] }
        },
        required: ["title", "dueDate", "priority"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "createProject",
      description: "Create a new project for the user.",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string" },
          description: { type: "string" },
          category: { type: "string" },
          priority: { type: "string", enum: ["low", "medium", "high"] }
        },
        required: ["name", "description", "category", "priority"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "createHabit",
      description: "Create a new habit to track.",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string" },
          description: { type: "string" },
          frequency: { type: "string", enum: ["daily", "weekly", "monthly"] }
        },
        required: ["name", "frequency"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "createLifeDomain",
      description: "Create a new Life Domain (e.g., Spiritual, Career).",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string" },
          description: { type: "string" }
        },
        required: ["name", "description"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "createDecision",
      description: "Log a new strategic decision.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string" },
          context: { type: "string", description: "The overarching context or description" },
          description: { type: "string", description: "A brief summary of the decision" },
          expectedOutcome: { type: "string", description: "The desired result of the decision" },
          reasoning: { type: "string", description: "The thought process behind the decision" }
        },
        required: ["title", "context"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "getFullLifeAnalysis",
      description: "Fetch all active projects, habits, tasks, and life domains to perform a deep analysis on the user's plan and health.",
      parameters: { type: "object", properties: {} }
    }
  }
]

const SYSTEM_PROMPT = `
You are the Ultimate AI Executive Coach for the Personal Executive OS. 
You are highly intelligent, deeply caring, yet strictly demanding of excellence. You communicate using occasional intelligent emojis (e.g., 🧠, ⚔️, 🌱, 🎯).

CRITICAL DIRECTIVES:
1. **EXTREME BREVITY**: Keep your responses incredibly short. NEVER write long paragraphs. Use concise bullet points and direct sentences.
2. **NO RAW JSON OR TAGS**: You MUST natively use your tool_calls feature to invoke functions. NEVER EVER write raw text like '<function=createDecision>...' in your message. If you need to create something, use the actual tool call mechanism.
3. **REAL SYSTEM LINKS**: When a tool succeeds, it returns a 'link' string (e.g., "/decisions"). You MUST use this exact string to create a Markdown link in your response. (Example: "I created the decision. [Click here to view it](/decisions)").
4. **Demand Excellence**: Do not accept laziness. Provide Godly, faith-based wisdom.
5. **Action-Oriented**: Always offer to create tasks, projects, decisions, or habits for the user using your tools.
`

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    const { messages, timeContext } = await req.json()

    await dbConnect()

    const systemMessage = {
      role: "system",
      content: SYSTEM_PROMPT + "\n\n" + (timeContext || "")
    }

    let responseMessage = null
    let currentMessages = [systemMessage, ...messages]

    const completion = await groq.chat.completions.create({
      messages: currentMessages,
      model: "llama-3.3-70b-versatile",
      tools: tools as any,
      tool_choice: "auto",
    })

    responseMessage = completion.choices[0].message

    if (responseMessage.tool_calls) {
      currentMessages.push(responseMessage)

      for (const toolCall of responseMessage.tool_calls) {
        const functionName = toolCall.function.name
        const args = JSON.parse(toolCall.function.arguments)
        let functionResult: any = null

        try {
          if (functionName === "getDailySummary") {
            const todayStart = new Date()
            todayStart.setHours(0, 0, 0, 0)
            const todayEnd = new Date()
            todayEnd.setHours(23, 59, 59, 999)

            const [pendingTasks, overdueTasks, habits] = await Promise.all([
              Task.find({ userId, status: { $ne: "completed" }, dueDate: { $gte: todayStart, $lte: todayEnd } }),
              Task.find({ userId, status: { $ne: "completed" }, dueDate: { $lt: todayStart } }),
              Habit.find({ userId })
            ])

            functionResult = {
              overdueTasks: overdueTasks.map(t => ({ id: t.id, title: t.title })),
              todayTasks: pendingTasks.map(t => ({ id: t.id, title: t.title })),
              habitsTracking: habits.length
            }
          } else if (functionName === "rescheduleTask") {
            const task = await Task.findOneAndUpdate(
              { _id: args.taskId, userId },
              { dueDate: new Date(args.newDate) },
              { new: true }
            )
            functionResult = { success: !!task, taskTitle: task?.title }
          } else if (functionName === "sendStrictWarning") {
            const user = await User.findById(userId)
            if (user && user.pushSubscriptions && user.pushSubscriptions.length > 0) {
              const payload = JSON.stringify({ title: "AI Executive Coach", body: args.message, data: { url: "/tasks" } })
              await Promise.all(user.pushSubscriptions.map(async (sub: any) => {
                try { await webpush.sendNotification(sub, payload) } catch (e) {}
              }))
              functionResult = { success: true }
            } else {
              functionResult = { success: false, reason: "No push subscriptions found" }
            }
          } else if (functionName === "createTask") {
            const task = await Task.create({
              id: crypto.randomUUID(),
              userId,
              title: args.title,
              description: args.description || "",
              status: "pending",
              dueDate: args.dueDate ? new Date(args.dueDate) : new Date(),
              priority: args.priority || "medium",
              projectId: null
            })
            functionResult = { success: true, link: `/tasks` }
          } else if (functionName === "createProject") {
            const project = await Project.create({
              id: crypto.randomUUID(),
              userId,
              title: args.name,
              vision: args.description,
              status: "active",
              category: args.category || "General",
              priority: args.priority || "medium",
              progress: 0,
              tags: []
            })
            functionResult = { success: true, link: `/projects` }
          } else if (functionName === "createHabit") {
            const habit = await Habit.create({
              id: crypto.randomUUID(),
              userId,
              name: args.name,
              description: args.description || "",
              frequency: args.frequency,
              lifeDomainId: null,
              currentStreak: 0,
              longestStreak: 0
            })
            functionResult = { success: true, link: `/domains` } // Habits shown on domains page
          } else if (functionName === "createLifeDomain") {
            const domain = await LifeDomain.create({
              id: crypto.randomUUID(),
              userId,
              name: args.name,
              description: args.description,
              color: "#6366f1",
              icon: "compass",
              goals: []
            })
            functionResult = { success: true, link: `/domains` }
          } else if (functionName === "createDecision") {
            const decision = await Decision.create({
              id: crypto.randomUUID(),
              userId,
              title: args.title,
              description: args.description || args.context || "No description provided",
              reasoning: args.reasoning || "Not specified",
              expectedOutcome: args.expectedOutcome || "Not specified",
              status: "pending"
            })
            functionResult = { success: true, link: `/decisions` }
          } else if (functionName === "getFullLifeAnalysis") {
            const [projects, habits, domains, tasks] = await Promise.all([
              Project.find({ userId }),
              Habit.find({ userId }),
              LifeDomain.find({ userId }),
              Task.find({ userId, status: { $ne: "completed" } })
            ])
            functionResult = {
              projects: projects.map(p => p.name),
              habits: habits.map(h => h.name),
              domains: domains.map(d => d.name),
              pendingTasksCount: tasks.length
            }
          }
        } catch (e: any) {
          functionResult = { success: false, error: e.message }
        }

        currentMessages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          name: functionName,
          content: JSON.stringify(functionResult)
        })
      }

      const finalCompletion = await groq.chat.completions.create({
        messages: currentMessages,
        model: "llama-3.3-70b-versatile"
      })
      responseMessage = finalCompletion.choices[0].message
    }

    return NextResponse.json({ message: responseMessage.content })
  } catch (error: any) {
    console.error("GROQ API ERROR:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
