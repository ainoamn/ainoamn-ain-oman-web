// src/__tests__/components/WhatsAppButton.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import WhatsAppButton from '@/components/WhatsAppButton';

describe('WhatsAppButton', () => {
  const mockProperty = {
    id: 'prop_123',
    titleAr: 'فيلا فاخرة',
    priceOMR: 150000,
    referenceNo: 'REF-001',
  };

  it('renders the WhatsApp button', () => {
    render(<WhatsAppButton />);
    const button = screen.getByTitle('تواصل عبر WhatsApp');
    expect(button).toBeInTheDocument();
  });

  it('shows menu when clicked with property', () => {
    render(<WhatsAppButton property={mockProperty} />);
    const button = screen.getByTitle('تواصل عبر WhatsApp');
    fireEvent.click(button);
    
    expect(screen.getByText('تواصل معنا')).toBeInTheDocument();
    expect(screen.getByText('📩 استفسار عن العقار')).toBeInTheDocument();
  });

  it('opens WhatsApp directly when no property', () => {
    const openSpy = jest.spyOn(window, 'open').mockImplementation();
    render(<WhatsAppButton />);
    const button = screen.getByTitle('تواصل عبر WhatsApp');
    fireEvent.click(button);
    
    expect(openSpy).toHaveBeenCalled();
    openSpy.mockRestore();
  });
});

