import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

const tasksPath = path.join(process.cwd(), '.data', 'tasks.json');

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  try {
    const fileData = fs.readFileSync(tasksPath, 'utf8');
    const data = JSON.parse(fileData);

    if (req.method === 'GET') {
      const task = data.tasks.find((t: any) => t.id === id);
      
      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }

      res.status(200).json({ success: true, task });

    } else if (req.method === 'PUT' || req.method === 'PATCH') {
      const taskIndex = data.tasks.findIndex((t: any) => t.id === id);

      if (taskIndex === -1) {
        return res.status(404).json({ error: 'Task not found' });
      }

      // تحديث المهمة
      const updates = req.body;
      
      // إذا تم تحديث الحالة إلى completed، أضف completedAt
      if (updates.status === 'completed' && data.tasks[taskIndex].status !== 'completed') {
        updates.completedAt = new Date().toISOString();
      }

      data.tasks[taskIndex] = {
        ...data.tasks[taskIndex],
        ...updates,
        updatedAt: new Date().toISOString()
      };

      fs.writeFileSync(tasksPath, JSON.stringify(data, null, 2), 'utf8');

      res.status(200).json({
        success: true,
        task: data.tasks[taskIndex]
      });

    } else if (req.method === 'DELETE') {
      const taskIndex = data.tasks.findIndex((t: any) => t.id === id);

      if (taskIndex === -1) {
        return res.status(404).json({ error: 'Task not found' });
      }

      data.tasks.splice(taskIndex, 1);
      fs.writeFileSync(tasksPath, JSON.stringify(data, null, 2), 'utf8');

      res.status(200).json({
        success: true,
        message: 'Task deleted'
      });

    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }

  } catch (error) {
    console.error('Error in /api/tasks/[id]:', error);
    res.status(500).json({ 
      error: 'Failed to process task',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

