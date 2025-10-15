import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

const tasksPath = path.join(process.cwd(), '.data', 'tasks.json');

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const fileData = fs.readFileSync(tasksPath, 'utf8');
    const data = JSON.parse(fileData);

    if (req.method === 'GET') {
      const { userId, status, priority, category } = req.query;

      let tasks = data.tasks || [];

      // فلترة حسب المستخدم
      if (userId) {
        tasks = tasks.filter((t: any) => t.userId === userId || t.assignedTo === userId);
      }

      // فلترة حسب الحالة
      if (status) {
        tasks = tasks.filter((t: any) => t.status === status);
      }

      // فلترة حسب الأولوية
      if (priority) {
        tasks = tasks.filter((t: any) => t.priority === priority);
      }

      // فلترة حسب الفئة
      if (category) {
        tasks = tasks.filter((t: any) => t.category === category);
      }

      // ترتيب حسب الأولوية والتاريخ
      tasks.sort((a: any, b: any) => {
        const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
        const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] ?? 4;
        const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] ?? 4;
        
        if (aPriority !== bPriority) {
          return aPriority - bPriority;
        }
        
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      });

      const pendingCount = tasks.filter((t: any) => t.status === 'pending').length;
      const inProgressCount = tasks.filter((t: any) => t.status === 'in_progress').length;
      const completedCount = tasks.filter((t: any) => t.status === 'completed').length;
      const overdueCount = tasks.filter((t: any) => 
        t.status !== 'completed' && new Date(t.dueDate) < new Date()
      ).length;

      res.status(200).json({
        success: true,
        tasks,
        count: tasks.length,
        stats: {
          pending: pendingCount,
          inProgress: inProgressCount,
          completed: completedCount,
          overdue: overdueCount
        }
      });

    } else if (req.method === 'POST') {
      const newTask = {
        id: `task_${Date.now()}`,
        ...req.body,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        completedAt: null
      };

      data.tasks = data.tasks || [];
      data.tasks.push(newTask);

      fs.writeFileSync(tasksPath, JSON.stringify(data, null, 2), 'utf8');

      res.status(201).json({
        success: true,
        task: newTask
      });

    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }

  } catch (error) {
    console.error('Error in /api/tasks:', error);
    res.status(500).json({ 
      error: 'Failed to process tasks',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
