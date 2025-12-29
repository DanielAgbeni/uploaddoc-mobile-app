import { useMutation } from '@tanstack/react-query';
import { loginUser } from '../api/auth';
import { useUserStore } from '../shared/user-store/useUserStore';
import { AxiosError } from 'axios';
import { onError } from 'src/utils/toast';

type LoginMutationData = {
  email: string;
  password: string;
};

export const useLoginMutation = () => {
  const setLoginData = useUserStore((state) => state.setLoginData);

  return useMutation({
    mutationFn: (data: LoginMutationData) => loginUser(data),
    
    onSuccess: (response) => {
      // Store auth data in Zustand and MMKV
      setLoginData(response.data.data);
    },


    onError: (error: AxiosError<ErrorResponseType>) => {
        onError(error.response?.data?.message || error.message);
      console.error('Login error:', error.response?.data || error.message);
    },
  });
};
