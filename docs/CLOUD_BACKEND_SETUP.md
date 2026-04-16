# SemiCircle Cloud Backend Setup

## What Changed

This project now includes a cloud-backed backend skeleton for:

- user bootstrap and profile update
- posts and comments
- likes, follows, favorites
- job applications
- private chat creation and message sending
- unified search
- article/job profile view recording
- seed data initialization

## Cloud Functions Added

- `login`
- `updateUser`
- `createPost`
- `addComment`
- `toggleLike`
- `toggleFollow`
- `toggleFavorite`
- `applyJob`
- `createChat`
- `sendMessage`
- `search`
- `recordView`
- `initData`

## Collections To Create

Create these collections in Tencent Cloud / WeChat Cloud Development:

- `users`
- `news`
- `posts`
- `comments`
- `favorites`
- `jobs`
- `talents`
- `chats`
- `messages`
- `applications`
- `profile_views`
- `follows`

## Deployment Order

1. Open the project in WeChat DevTools.
2. Make sure cloud development is enabled for the project.
3. If you have a fixed cloud env id, set `cloudEnvId` in [app.js](/f:/个人项目/SemiParty/miniprogram/app.js). Leaving it empty lets DevTools use the selected default environment.
4. Upload and deploy all new cloud functions.
5. Create the collections listed above if they do not already exist.
6. Run the `initData` cloud function once to insert seed data.
7. Rebuild the mini program and verify pages now read from cloud data.

## Current Frontend Behavior

[api.js](/f:/个人项目/SemiParty/miniprogram/utils/api.js) is now:

- cloud-first when `wx.cloud` is available
- mock fallback when cloud calls fail or the environment is not ready

That means you can continue developing UI locally, then switch to real cloud data without changing page code.

## Notes

- `login` auto-creates a default user document on first launch.
- `createPost` increments `users.stats.posts`.
- `toggleLike` persists state on target documents using `likedOpenids`.
- `applyJob` prevents duplicate applications per user/job pair.
- `createChat` reuses an existing private chat when one already exists.
- `sendMessage` updates `chats.lastMessage` and `chats.unreadMap`.
