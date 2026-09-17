export type JsonObject = Record<string, unknown>

export interface BridgeRequest {
  id: string
  method: string
  params: JsonObject
}

export interface BridgeResponse {
  ok: boolean
  result?: JsonObject
  error?: { code: string; message: string; details?: JsonObject }
}

export interface NxBridge {
  call(method: string, params?: JsonObject): Promise<JsonObject>
}
