# @gyxsza/approval-alert

Plays a sound and shows a system notification when DeepSeek Harness asks for permission approval, so you never miss an approval prompt again.

当 DeepSeek Harness 弹出权限审批时，播放提示音并显示系统通知，避免错过审批请求。

## What it does / 功能

- **Sound / 提示音**: plays a three-tone beep via Web Audio when an approval is requested.
- **Notification / 系统通知**: shows a desktop notification with the requesting tool name.
- **Non-blocking / 不干扰裁决**: it only *listens* to the approval event and always delegates the decision to the approval UI — it never answers the request itself.

## Install / 安装

Add this package's market index URL to DSH's plugin market, then install `@gyxsza/approval-alert` from the Discover page. Or install directly:

```bash
dsh plugin install @gyxsza/approval-alert
```

## Requirements / 依赖

- DSH `0.2.2-rc.1`
- Node `>=20`

## License

MIT
