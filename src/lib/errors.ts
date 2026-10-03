// 类型化错误体系：控制器/路由只把规范化结构返回给客户端，不泄露堆栈
export class AppError extends Error {
  status: number;
  code: string;
  constructor(message: string, status = 500, code = "INTERNAL") {
    super(message);
    this.status = status;
    this.code = code;
    this.name = "AppError";
  }
}

export class NotFoundError extends AppError {
  constructor(message = "资源不存在") {
    super(message, 404, "NOT_FOUND");
  }
}

export class ValidationError extends AppError {
  constructor(message = "参数校验失败") {
    super(message, 400, "VALIDATION");
  }
}

export class AuthError extends AppError {
  constructor(message = "未授权") {
    super(message, 401, "UNAUTHENTICATED");
  }
}

// 把未知错误规范化为客户端可见结构
export function toErrorResponse(err: unknown) {
  if (err instanceof AppError) {
    return { error: { code: err.code, message: err.message }, status: err.status };
  }
  console.error("[unhandled]", err);
  return { error: { code: "INTERNAL", message: "服务器内部错误" }, status: 500 };
}
