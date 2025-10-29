import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

const templatesPath = path.join(process.cwd(), '.data', 'contract-templates.json');

interface Template {
  id: string;
  name: string;
  description: string;
  category: 'contracts' | 'requests' | 'letters';
  type: string;
  usageTypes: string[];
  content: {
    sections: Array<{
      title: string;
      clauses: string[];
    }>;
  };
  linkedProperties?: string[];
  linkedUnits?: string[];
  linkedUsageTypes?: string[];
  isDefault?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (!fs.existsSync(templatesPath)) {
      fs.writeFileSync(templatesPath, JSON.stringify({ templates: [] }, null, 2));
    }

    const fileData = fs.readFileSync(templatesPath, 'utf8');
    const data = JSON.parse(fileData);

    if (req.method === 'GET') {
      const { category, type, usageType, propertyId, unitId } = req.query;
      let templates = data.templates || [];

      // Filter by category
      if (category) {
        templates = templates.filter((t: Template) => t.category === category);
      }

      // Filter by type
      if (type) {
        templates = templates.filter((t: Template) => t.type === type);
      }

      // Filter by usage type
      if (usageType) {
        templates = templates.filter((t: Template) => 
          t.usageTypes?.includes(usageType as string) || 
          t.linkedUsageTypes?.includes(usageType as string)
        );
      }

      // Filter by property
      if (propertyId) {
        templates = templates.filter((t: Template) => 
          t.linkedProperties?.includes(propertyId as string) ||
          !t.linkedProperties || t.linkedProperties.length === 0
        );
      }

      // Filter by unit
      if (unitId) {
        templates = templates.filter((t: Template) => 
          t.linkedUnits?.includes(unitId as string) ||
          !t.linkedUnits || t.linkedUnits.length === 0
        );
      }

      return res.status(200).json({ templates });
    }

    if (req.method === 'POST') {
      const template: Template = req.body;
      template.id = template.id || `template-${Date.now()}`;
      template.createdAt = new Date().toISOString();
      template.updatedAt = new Date().toISOString();

      if (!data.templates) {
        data.templates = [];
      }

      data.templates.push(template);
      fs.writeFileSync(templatesPath, JSON.stringify(data, null, 2));

      return res.status(201).json({ template });
    }

    if (req.method === 'PUT') {
      const { id } = req.query;
      const updates = req.body;

      if (!data.templates) {
        return res.status(404).json({ error: 'No templates found' });
      }

      const index = data.templates.findIndex((t: Template) => t.id === id);
      if (index === -1) {
        return res.status(404).json({ error: 'Template not found' });
      }

      data.templates[index] = {
        ...data.templates[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };

      fs.writeFileSync(templatesPath, JSON.stringify(data, null, 2));
      return res.status(200).json({ template: data.templates[index] });
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;

      if (!data.templates) {
        return res.status(404).json({ error: 'No templates found' });
      }

      data.templates = data.templates.filter((t: Template) => t.id !== id);
      fs.writeFileSync(templatesPath, JSON.stringify(data, null, 2));

      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error in templates API:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
