import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

// استخدام ملفات منفصلة لنظامنا
const PLANS_FILE = path.join(process.cwd(), '.data', 'custom-subscription-plans.json');
const FEATURES_FILE = path.join(process.cwd(), '.data', 'custom-plan-features.json');

// التأكد من وجود مجلد .data
const ensureDataDir = () => {
  const dataDir = path.join(process.cwd(), '.data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
};

// قراءة الباقات
const readPlans = () => {
  try {
    ensureDataDir();
    if (fs.existsSync(PLANS_FILE)) {
      const data = fs.readFileSync(PLANS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading plans:', error);
  }
  return null;
};

// حفظ الباقات
const savePlans = (plans: any[]) => {
  try {
    ensureDataDir();
    fs.writeFileSync(PLANS_FILE, JSON.stringify(plans, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('Error saving plans:', error);
    return false;
  }
};

// قراءة صلاحيات الباقات
const readPlanFeatures = () => {
  try {
    ensureDataDir();
    if (fs.existsSync(FEATURES_FILE)) {
      const data = fs.readFileSync(FEATURES_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading plan features:', error);
  }
  return null;
};

// حفظ صلاحيات الباقات
const savePlanFeatures = (features: Record<string, string[]>) => {
  try {
    ensureDataDir();
    fs.writeFileSync(FEATURES_FILE, JSON.stringify(features, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('Error saving plan features:', error);
    return false;
  }
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        // قراءة الباقات والصلاحيات من الملفات
        const plans = readPlans();
        const features = readPlanFeatures();
        
        console.log('📖 API GET - قراءة البيانات:', { 
          plansFound: !!plans, 
          featuresFound: !!features 
        });
        
        res.status(200).json({
          plans,
          features,
          success: true
        });
        break;

      case 'POST':
        // حفظ الباقات والصلاحيات
        const { plans: newPlans, features: newFeatures } = req.body;

        console.log('💾 API POST - استلام البيانات:', { 
          plansCount: newPlans?.length, 
          featuresCount: Object.keys(newFeatures || {}).length 
        });

        if (!newPlans && !newFeatures) {
          return res.status(400).json({
            error: 'Missing plans or features data',
            success: false
          });
        }

        let saved = true;

        // حفظ الباقات
        if (newPlans) {
          const plansSaved = savePlans(newPlans);
          console.log('💾 حفظ الباقات:', plansSaved ? 'نجح ✅' : 'فشل ❌');
          if (!plansSaved) saved = false;
        }

        // حفظ الصلاحيات
        if (newFeatures) {
          const featuresSaved = savePlanFeatures(newFeatures);
          console.log('💾 حفظ الصلاحيات:', featuresSaved ? 'نجح ✅' : 'فشل ❌');
          if (!featuresSaved) saved = false;
        }

        if (saved) {
          res.status(200).json({
            message: 'تم حفظ التغييرات بنجاح',
            success: true,
            saved: {
              plans: !!newPlans,
              features: !!newFeatures
            }
          });
        } else {
          res.status(500).json({
            error: 'فشل في حفظ بعض البيانات',
            success: false
          });
        }
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).json({ error: `Method ${method} not allowed` });
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: (error as Error).message
    });
  }
}

