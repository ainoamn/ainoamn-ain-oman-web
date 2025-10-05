import axios from 'axios';

const GOVERNMENT_API_URL = process.env.GOVERNMENT_API_URL;
const API_KEY = process.env.GOVERNMENT_API_KEY;

export async function verifyPropertyOwnership(propertyId: string, ownerId: string) {
  try {
    const response = await axios.post(
      `${GOVERNMENT_API_URL}/verify-ownership`,
      {
        propertyId,
        ownerId,
      },
      {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    return response.data.isVerified;
  } catch (error) {
    console.error('Error verifying property ownership:', error);
    return false;
  }
}

export async function registerContract(contractData: any) {
  try {
    const response = await axios.post(
      `${GOVERNMENT_API_URL}/register-contract`,
      contractData,
      {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    return response.data.registrationNumber;
  } catch (error) {
    console.error('Error registering contract:', error);
    throw new Error('فشل في تسجيل العقد لدى الجهة الحكومية');
  }
}