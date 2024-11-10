## AIGEA 代理机器人 [https://app.aigaea.net/](https://app.aigaea.net/register?ref=gaU26qDGEI53kx)

![image](https://github.com/user-attachments/assets/85941907-739c-4da4-a8c0-63942b81f662)




# Aigaea 代理管理器

这是一个与 Aigaea API 交互的代理管理脚本，允许您通过代理进行身份验证、跟踪评分以及管理浏览器会话。该脚本会定期获取代理列表并对其进行 ping 操作，同时管理身份验证会话。

## 环境要求

- Node.js (v16 或更高版本)
- npm (Node 包管理器)
- Aigaea 账号（用于获取访问令牌）

## 安装

1. **克隆仓库或下载脚本**：

    ```bash
    git clone https://github.com/ziqing888/Ai-Gaea.git
    cd Ai-Gaea

    ```

2. **安装依赖**：

    该脚本需要一些依赖包，如 `node-fetch`、`https-proxy-agent` 和 `readline`。您可以通过以下命令安装：

    ```bash
    npm install
    ```

    所需的依赖包已列在 `package.json` 中。

3. **创建 `proxy.txt` 文件**：

    将代理列表保存到此文件中，每行一个代理地址。


## 获取访问令牌

要获取身份验证所需的 `accessToken`，请按照以下步骤操作：

1. 登录到您的 [Aigaea 控制面板](https://app.aigaea.net/dashboard)。
2. 打开浏览器的开发者工具（按 `F12` 键，或右键点击页面选择“检查”）。
3. 选择 **Console**（控制台）选项卡，然后输入以下命令并按回车：

    ```javascript
    localStorage.getItem('gaea_token');
    ```

4. 控制台中会显示一个类似 `"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVC..."` 的字符串，这就是您的 `accessToken`。将此令牌复制下来，用于脚本中。

   ![image](https://github.com/user-attachments/assets/d2fa1cc3-6d0f-4bcc-9fa2-38b55b8fc510)



## 运行脚本

1. **运行脚本**：

    在安装好依赖并配置 `proxy.txt` 文件后，可以使用 Node.js 运行脚本：

    ```bash
    npm run start
    ```


## 工作原理

 **代理身份验证和 ping 操作**：
    - 该脚本使用您的访问令牌与 Aigaea 进行身份验证。
    - 它会为每个代理获取一个 `browser_id`，并将其存储以便将来使用。
    - 脚本会定期 ping 代理，以确保其仍然可用且评分较高。
    - 如果代理的评分低于某个阈值，脚本将重新进行身份验证并重新开始 ping 过程。
