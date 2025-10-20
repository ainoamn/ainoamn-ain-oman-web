// @ts-nocheck
import { put } from '@vercel/blob';
import { createId } from '@paralleldrive/cuid2';
import { documentStore } from './store';

export class DocumentService {
  async uploadDocument(file: File, caseId: string, userId: string) {
    const filename = `${createId()}-${file.name}`;
    const blob = await put(filename, file, {
      access: 'public',
      addRandomSuffix: false
    });

    return await documentStore.create({
      title: file.name,
      fileUrl: blob.url,
      fileSize: file.size,
      mimeType: file.type,
      caseId: caseId,
      uploadedBy: userId
    });
  }

  async getDocuments(caseId: string) {
    return await documentStore.findByCaseId(caseId);
  }
}
