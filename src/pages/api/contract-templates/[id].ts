import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

const templatesPath = path.join(process.cwd(), '.data', 'contract-templates.json');

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;

    if (!fs.existsSync(templatesPath)) {
      return res.status(404).json({ error: 'Template not found' });
    }

    const fileData = fs.readFileSync(templatesPath, 'utf8');
    const data = JSON.parse(fileData);
    const template = data.templates?.find((t: any) => t.id === id);

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    if (req.method === 'GET') {
      return res.status(200).json({ template });
    }

    if (req.method === 'PATCH') {
      const updates = req.body;

      // Handle linking/unlinking
      if (updates.linkProperty !== undefined) {
        if (!template.linkedProperties) template.linkedProperties = [];
        if (updates.linkProperty && !template.linkedProperties.includes(updates.linkProperty)) {
          template.linkedProperties.push(updates.linkProperty);
        } else if (!updates.linkProperty) {
          template.linkedProperties = template.linkedProperties.filter((p: string) => p !== updates.linkProperty);
        }
      }

      if (updates.linkUnit !== undefined) {
        if (!template.linkedUnits) template.linkedUnits = [];
        if (updates.linkUnit && !template.linkedUnits.includes(updates.linkUnit)) {
          template.linkedUnits.push(updates.linkUnit);
        } else if (!updates.linkUnit) {
          template.linkedUnits = template.linkedUnits.filter((u: string) => u !== updates.linkUnit);
        }
      }

      if (updates.linkUsageType !== undefined) {
        if (!template.linkedUsageTypes) template.linkedUsageTypes = [];
        if (updates.linkUsageType && !template.linkedUsageTypes.includes(updates.linkUsageType)) {
          template.linkedUsageTypes.push(updates.linkUsageType);
        } else if (!updates.linkUsageType) {
          template.linkedUsageTypes = template.linkedUsageTypes.filter((u: string) => u !== updates.linkUsageType);
        }
      }

      const index = data.templates.findIndex((t: any) => t.id === id);
      data.templates[index] = {
        ...template,
        ...updates,
        updatedAt: new Date().toISOString()
      };

      fs.writeFileSync(templatesPath, JSON.stringify(data, null, 2));
      return res.status(200).json({ template: data.templates[index] });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error in template API:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
