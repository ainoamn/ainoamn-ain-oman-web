// src/pages/tasks.tsx - صفحة المهام
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import InstantLink from '@/components/InstantLink';
import { 
  FiCheck, FiX, FiClock, FiAlertCircle, FiPlus, 
  FiEdit2, FiTrash2, FiFilter, FiCalendar
} from 'react-icons/fi';

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: string;
  assignedTo?: string;
  createdAt: string;
}

export default function TasksPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    loadTasks();
  }, [mounted]);

  const loadTasks = async () => {
    try {
      const response = await fetch('/api/tasks');
      if (response.ok) {
        const data = await response.json();
        setTasks(data.tasks || []);
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateTaskStatus = async (taskId: string, status: Task['status']) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (response.ok) {
        loadTasks();
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه المهمة؟')) return;
    try {
      const response = await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
      if (response.ok) {
        loadTasks();
      }
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const filteredTasks = filter === 'all' ? tasks : tasks.filter(t => t.status === filter);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'red';
      case 'high': return 'orange';
      case 'medium': return 'yellow';
      case 'low': return 'green';
      default: return 'gray';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <FiCheck className="text-green-600" />;
      case 'in_progress': return <FiClock className="text-blue-600" />;
      case 'cancelled': return <FiX className="text-red-600" />;
      default: return <FiAlertCircle className="text-gray-600" />;
    }
  };

  if (!mounted || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>المهام | Ain Oman</title>
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8" dir="rtl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">📋 المهام</h1>
                <p className="text-gray-600 mt-1">إدارة المهام والمتابعة</p>
              </div>
              <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold hover:shadow-lg transition">
                <FiPlus className="inline ml-2" />
                مهمة جديدة
              </button>
            </div>

            {/* الفلاتر */}
            <div className="flex gap-2 flex-wrap">
              {[
                { id: 'all', label: 'الكل', count: tasks.length },
                { id: 'pending', label: 'قيد الانتظار', count: tasks.filter(t => t.status === 'pending').length },
                { id: 'in_progress', label: 'قيد التنفيذ', count: tasks.filter(t => t.status === 'in_progress').length },
                { id: 'completed', label: 'مكتملة', count: tasks.filter(t => t.status === 'completed').length }
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id as any)}
                  className={`px-4 py-2 rounded-lg font-semibold transition ${
                    filter === f.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {f.label} ({f.count})
                </button>
              ))}
            </div>
          </div>

          {/* قائمة المهام */}
          <div className="space-y-4">
            {filteredTasks.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                <FiCheck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-xl font-bold text-gray-900 mb-2">لا توجد مهام</p>
                <p className="text-gray-600">قم بإضافة مهمة جديدة للبدء</p>
              </div>
            ) : (
              filteredTasks.map((task) => (
                <div key={task.id} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                      {getStatusIcon(task.status)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">{task.title}</h3>
                          <p className="text-gray-600 mt-1">{task.description}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-bold bg-${getPriorityColor(task.priority)}-100 text-${getPriorityColor(task.priority)}-700`}>
                          {task.priority === 'urgent' ? 'عاجل' : task.priority === 'high' ? 'عالي' : task.priority === 'medium' ? 'متوسط' : 'منخفض'}
                        </span>
                      </div>
                      {task.dueDate && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                          <FiCalendar className="w-4 h-4" />
                          <span>الموعد النهائي: {new Date(task.dueDate).toLocaleDateString('ar-SA')}</span>
                        </div>
                      )}
                      <div className="flex gap-2">
                        {task.status !== 'completed' && (
                          <button
                            onClick={() => updateTaskStatus(task.id, 'completed')}
                            className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition font-semibold text-sm"
                          >
                            <FiCheck className="inline ml-1" />
                            إكمال
                          </button>
                        )}
                        {task.status !== 'in_progress' && task.status !== 'completed' && (
                          <button
                            onClick={() => updateTaskStatus(task.id, 'in_progress')}
                            className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition font-semibold text-sm"
                          >
                            <FiClock className="inline ml-1" />
                            بدء التنفيذ
                          </button>
                        )}
                        <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-semibold text-sm">
                          <FiEdit2 className="inline ml-1" />
                          تعديل
                        </button>
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition font-semibold text-sm"
                        >
                          <FiTrash2 className="inline ml-1" />
                          حذف
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}

