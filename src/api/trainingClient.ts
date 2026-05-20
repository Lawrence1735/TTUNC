import apiClient from './client';

export interface TraineeResponse {
  id: string;
  user_id?: string;
  talent_group: string;
  instrument?: string;
  voice?: string;
  [key: string]: any;
}

class TrainingClient {
  /**
   * Fetch all trainees from the API
   */
  async getTrainees(): Promise<TraineeResponse[]> {
    try {
      const response = await apiClient.get('/trainees');
      return response.data || [];
    } catch (error: any) {
      console.error('Error fetching trainees:', error);
      throw {
        message: error.message || 'Failed to fetch trainees',
        status: error.status,
      };
    }
  }

  /**
   * Fetch a specific trainee by ID
   */
  async getTrainee(traineeId: string): Promise<TraineeResponse> {
    try {
      const response = await apiClient.get(`/trainees/${traineeId}`);
      return response.data;
    } catch (error: any) {
      console.error(`Error fetching trainee ${traineeId}:`, error);
      throw {
        message: error.message || `Failed to fetch trainee ${traineeId}`,
        status: error.status,
      };
    }
  }

  /**
   * Update trainee information
   */
  async updateTrainee(traineeId: string, data: Partial<TraineeResponse>): Promise<TraineeResponse> {
    try {
      const response = await apiClient.put(`/trainees/${traineeId}`, data);
      return response.data;
    } catch (error: any) {
      console.error(`Error updating trainee ${traineeId}:`, error);
      throw {
        message: error.message || `Failed to update trainee ${traineeId}`,
        status: error.status,
      };
    }
  }

  /**
   * Fetch trainee attendance records
   */
  async getAttendance(traineeId: string): Promise<any[]> {
    try {
      const response = await apiClient.get(`/trainees/${traineeId}/attendance`);
      return response.data || [];
    } catch (error: any) {
      console.error(`Error fetching attendance for trainee ${traineeId}:`, error);
      throw {
        message: error.message || `Failed to fetch attendance for trainee ${traineeId}`,
        status: error.status,
      };
    }
  }

  /**
   * Fetch trainee progress/training records
   */
  async getTraineeProgress(traineeId: string): Promise<any> {
    try {
      const response = await apiClient.get(`/trainees/${traineeId}/progress`);
      return response.data;
    } catch (error: any) {
      console.error(`Error fetching progress for trainee ${traineeId}:`, error);
      throw {
        message: error.message || `Failed to fetch progress for trainee ${traineeId}`,
        status: error.status,
      };
    }
  }
}

// Export singleton instance
const trainingClient = new TrainingClient();
export default trainingClient;
