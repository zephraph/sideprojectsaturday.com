export interface SwitchBotStatusResponse {
	statusCode: number;
	body: SwitchBotDeviceStatus;
	message: string;
}

export interface SwitchBotDeviceStatus {
	deviceId: string;
	deviceType: string;
	hubDeviceId: string;
	battery: number;
	version: string;
	deviceName: string;
	enableCloudService: boolean;
	hubDeviceName: string;
}

export interface SwitchBotApiResponse {
	success: boolean;
	data?: SwitchBotDeviceStatus;
	error?: string;
	statusCode?: number;
	message?: string;
}