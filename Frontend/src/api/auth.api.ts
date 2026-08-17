import { axiosClient } from "@/lib/axiosClient";
import type {
  LoginRequestDto,
  LoginResponseDto,
  RegisterRequestDto,
  RegisterResponse,
} from "@/types/auth.types";

export const authApi = {
  login: async (payload: LoginRequestDto): Promise<LoginResponseDto> => {
    const { data } = await axiosClient.post<LoginResponseDto>(
      "/auth/login",
      payload
    );
    return data;
  },

  register: async (
    payload: RegisterRequestDto
  ): Promise<RegisterResponse> => {
    const { data } = await axiosClient.post<RegisterResponse>(
      "/auth/register",
      payload
    );
    return data;
  },
};