@echo off
echo 正在查找占用3000端口的进程...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
    echo 找到进程 PID: %%a
    taskkill /PID %%a /F
    echo 进程已关闭
)
echo.
echo 现在可以重新启动服务了
pause

