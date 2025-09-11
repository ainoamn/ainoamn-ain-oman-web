import React from 'react';
import { useForm } from 'react-hook-form';

interface CaseFormProps {
  onSubmit: (data: any) => void;
  initialData?: any;
}

export const CaseForm: React.FC<CaseFormProps> = ({ onSubmit, initialData }) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: initialData
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="caseNumber">رقم القضية</label>
        <input
          {...register('caseNumber', { required: 'رقم القضية مطلوب' })}
          className="input"
        />
        {errors.caseNumber && <span>{errors.caseNumber.message}</span>}
      </div>

      <div>
        <label htmlFor="title">عنوان القضية</label>
        <input
          {...register('title', { required: 'عنوان القضية مطلوب' })}
          className="input"
        />
        {errors.title && <span>{errors.title.message}</span>}
      </div>

      <div>
        <label htmlFor="description">الوصف</label>
        <textarea
          {...register('description')}
          className="textarea"
        />
      </div>

      <button type="submit" className="btn btn-primary">
        حفظ
      </button>
    </form>
  );
};