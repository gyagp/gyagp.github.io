import publicProjects from "./projects.js";
import { isGuestVisible, toGuestProject } from "./project-access.js";

(() => {
  "use strict";

  const translations = {
    zh: {
      title: "顾扬 Yang Gu — 好奇心驱动，代码实现",
      metaDescription:
        "顾扬的个人项目集：从日常工具、语言学习到浏览器游戏，记录把好奇心做成作品的过程。",
      skip: "跳到项目",
      navigation: "主导航",
      navProjects: "项目",
      navAbout: "关于",
      navContact: "联系",
      login: "登录",
      logout: "退出",
      loginTitle: "登录我的工作室",
      loginDescription: "登录后查看我的其它项目，目前仅限 gyagp。",
      username: "用户名",
      password: "密码",
      closeLogin: "关闭登录",
      invalidCredentials: "用户名或密码不正确。",
      rateLimit: "尝试次数过多，请稍后再试。",
      unavailable: "登录服务暂不可用，请稍后再试。",
      loginSuccess: "已登录，其它项目已在独立分组显示。",
      logoutSuccess: "已退出，现在显示访客可见项目。",
      sessionExpired: "登录已过期，现在显示访客可见项目。",
      enterprise: "需企业账号访问权限",
      enterpriseCode: "企业访问",
      intro: "你好，我是顾扬",
      heroLineOne: "把好奇心，",
      heroLineTwo: "做成小作品。",
      heroDescription:
        "从一个日常需要，到一个可以使用的作品。这里放着我做的工具、游戏，以及一些正在生长的想法。",
      explore: "逛逛我的项目",
      heroNote: "一点实用，一点好玩。",
      projectsTitle: "我的项目",
      guestProjects: "公开展示",
      guestProjectsDescription: "已发布或代码公开的项目，访客均可查看。",
      personalProjects: "我的其它项目",
      personalProjectsDescription: "仅 gyagp 可见 · 未发布的私有项目与企业项目",
      groupEmpty: "此分组没有符合筛选条件的项目。",
      orderHint: "拖动卡片手柄或使用箭头排序，偏好保存在当前浏览器。",
      orderHintServer: "拖动或置顶调整排列，登录后的偏好会同步到服务器。",
      savingOrder: "正在保存…",
      savedOrder: "已保存到服务器",
      saveOrderError: "尚未保存，请重试。",
      retrySave: "重试保存",
      started: "开始",
      updated: "更新",
      datePending: "待确认",
      resetOrder: "恢复默认顺序",
      orderUpdated: "顺序已调整",
      orderReset: "已恢复默认顺序",
      pinned: "已置顶",
      pinProject: "置顶项目",
      unpinProject: "取消置顶",
      pinUpdated: "已置顶到当前分组",
      unpinUpdated: "已取消置顶",
      reorder: "调整顺序",
      dragProject: "拖动排序",
      moveUp: "向前移动",
      moveDown: "向后移动",
      projectsDescription: "用得上的工具，忍不住想做的尝试。",
      filterLabel: "项目分类",
      filterAll: "全部",
      filterTools: "实用工具",
      filterLearning: "学习与创作",
      filterGames: "游戏",
      filterAI: "AI 实验",
      filterGraphics: "Web 图形",
      search: "搜索项目",
      emptyTitle: "还没有找到这个项目",
      emptyDescription: "换个关键词，或看看全部项目。",
      reset: "查看全部项目 →",
      projectsFootnote:
        "发布不改变代码权限；私有仓库和受限下载仍需授权。企业访问不计入发布。",
      projectsClosing: "持续折腾，陆续更新。",
      public: "公开代码",
      private: "私有代码",
      unknown: "权限待确认",
      codeUnknown: "仓库待确认",
      codeUnverified: "仓库地址或访问权限尚未确认",
      code: "代码仓库",
      codeAccess: "私有仓库，需要访问权限",
      visit: "打开应用",
      download: "Windows 下载",
      deployment: "查看部署",
      vercel: "需 Vercel 账号授权",
      account: "需授权账号登录",
      registration: "登录或注册后使用",
      restricted: "下载需仓库访问权限",
      webgpu: "需支持 WebGPU 的浏览器",
      sourceBuild: "需本地构建",
      extension: "扩展需手动安装",
      unlisted: "暂无发布地址",
      privateRelease: "未公开发布",
      verify: "发布地址待确认",
      future: "后续计划",
      futurePending: "待更新",
      futureEmpty: "后续计划尚未公布，有新进展会在这里更新。",
      futureListed: "项计划",
      futureSourceLabel: "计划来源：项目记录 ↗",
      results: "个项目",
      repoLabel: "代码仓库",
      releaseLabel: "发布地址",
      aboutLineOne: "在代码与",
      aboutLineTwo: "日常之间。",
      aboutLead: "我是顾扬，一名喜欢把想法付诸实践的开发者。",
      aboutDescription:
        "关注 Web 图形、WebGPU 和 AI，也喜欢为日常的小问题写一点代码。这里既有认真打磨的工具，也有纯粹出于兴趣的实验。离开键盘，我也喜欢打羽毛球。",
      badminton: "羽毛球",
      contactTitle: "好想法，从交流开始。",
      contactDescription: "关于项目、技术，或者只是打个招呼。",
      copyEmail: "复制邮箱",
      copied: "邮箱已复制",
      copyFallback: "邮箱已选中，请手动复制。",
      footerNote: "保持好奇，继续创造。",
      backToTop: "回到顶部",
    },
    en: {
      title: "Yang Gu — Curiosity, made tangible",
      metaDescription:
        "A personal collection of everyday tools, learning apps, browser games, and AI experiments by Yang Gu.",
      skip: "Skip to projects",
      navigation: "Main navigation",
      navProjects: "Projects",
      navAbout: "About",
      navContact: "Contact",
      login: "Sign in",
      logout: "Sign out",
      loginTitle: "Enter the private workshop",
      loginDescription:
        "Sign in to view my other projects. Currently limited to gyagp.",
      username: "Username",
      password: "Password",
      closeLogin: "Close sign-in",
      invalidCredentials: "Incorrect username or password.",
      rateLimit: "Too many attempts. Please try again later.",
      unavailable:
        "Sign-in is temporarily unavailable. Please try again later.",
      loginSuccess:
        "Signed in. Additional projects appear in their own section.",
      logoutSuccess: "Signed out. Showing projects available to visitors.",
      sessionExpired:
        "Your session expired. Showing projects available to visitors.",
      enterprise: "Enterprise account access required",
      enterpriseCode: "Enterprise access",
      intro: "HELLO, I’M YANG GU",
      heroLineOne: "Curiosity,",
      heroLineTwo: "made tangible.",
      heroDescription:
        "From an everyday need to something you can use. A collection of tools, games, and ideas that are still growing.",
      explore: "Explore my projects",
      heroNote: "A little useful. A little playful.",
      projectsTitle: "My projects",
      guestProjects: "Public showcase",
      guestProjectsDescription:
        "Published projects or public code, available to every visitor.",
      personalProjects: "My other projects",
      personalProjectsDescription:
        "Only for gyagp · Unpublished private and enterprise projects",
      groupEmpty: "No projects match these filters in this section.",
      orderHint:
        "Drag the handle or use the arrows. Your order is saved in this browser.",
      orderHintServer:
        "Drag or pin projects. Signed-in preferences sync to the server.",
      savingOrder: "Saving…",
      savedOrder: "Saved to server",
      saveOrderError: "Not saved yet. Please retry.",
      retrySave: "Retry save",
      started: "Started",
      updated: "Updated",
      datePending: "Unconfirmed",
      resetOrder: "Reset order",
      orderUpdated: "Order updated",
      orderReset: "Default order restored",
      pinned: "Pinned",
      pinProject: "Pin project",
      unpinProject: "Unpin project",
      pinUpdated: "Pinned to the top of this section",
      unpinUpdated: "Project unpinned",
      reorder: "Reorder project",
      dragProject: "Drag to reorder",
      moveUp: "Move earlier",
      moveDown: "Move later",
      projectsDescription: "Useful little tools. Experiments I had to try.",
      filterLabel: "Project categories",
      filterAll: "All",
      filterTools: "Tools",
      filterLearning: "Learn & create",
      filterGames: "Games",
      filterAI: "AI experiments",
      filterGraphics: "Web graphics",
      search: "Find a project",
      emptyTitle: "No projects found",
      emptyDescription: "Try another keyword, or explore all the projects.",
      reset: "Show all projects →",
      projectsFootnote:
        "A release does not change code access. Private code and restricted downloads still require permission. Enterprise access is not a release.",
      projectsClosing: "Always making. Always learning.",
      public: "Public code",
      private: "Private code",
      unknown: "Access unverified",
      codeUnknown: "Unverified repo",
      codeUnverified: "Repository address or access is not yet confirmed",
      code: "Repository",
      codeAccess: "Private repository; access required",
      visit: "Open app",
      download: "Windows download",
      deployment: "View deployment",
      vercel: "Vercel sign-in required",
      account: "Authorized account required",
      registration: "Sign in or create an account",
      restricted: "Repository access required",
      webgpu: "WebGPU-capable browser required",
      sourceBuild: "Build from source",
      extension: "Install extension manually",
      unlisted: "No release listed",
      privateRelease: "No public release",
      verify: "Release to be confirmed",
      future: "Future work",
      futurePending: "To be updated",
      futureEmpty:
        "The next steps haven’t been announced yet. New plans will appear here.",
      futureListed: "planned",
      futureSourceLabel: "Source: project notes ↗",
      results: "projects",
      repoLabel: "repository",
      releaseLabel: "release",
      aboutLineOne: "Between code",
      aboutLineTwo: "and everyday life.",
      aboutLead:
        "I’m Yang Gu, a developer who likes turning ideas into things.",
      aboutDescription:
        "I’m interested in web graphics, WebGPU, and AI, and I enjoy writing a little code to solve everyday problems. Some projects here are carefully polished tools; others are experiments driven by curiosity. Away from the keyboard, I enjoy badminton.",
      badminton: "Badminton",
      contactTitle: "Good ideas start with a hello.",
      contactDescription: "Talk projects, talk tech, or simply say hello.",
      copyEmail: "Copy email address",
      copied: "Email address copied",
      copyFallback: "Email selected. Please copy it manually.",
      footerNote: "Stay curious. Keep making.",
      backToTop: "Back to top",
    },
  };

  const iconPaths = {
    lock: '<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
    globe:
      '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c5 5 5 13 0 18-5-5-5-13 0-18Z"/>',
    code: '<path d="m8 6-6 6 6 6m8-12 6 6-6 6m-3-15-2 18"/>',
    arrow: '<path d="M6 18 18 6M6 6h12v12"/>',
    chevron: '<path d="m6 9 6 6 6-6"/>',
    future: '<path d="M4 21V3m0 1c6-5 10 5 16 0v10c-6 5-10-5-16 0"/>',
    download: '<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    grip: '<circle cx="9" cy="5" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="19" r="1"/>',
    up: '<path d="M12 19V5m-6 6 6-6 6 6"/>',
    down: '<path d="M12 5v14m-6-6 6 6 6-6"/>',
    pin: '<path d="m9 3 12 12-4 1-3 3-3-6-6-3 3-3 1-4ZM11 13l-8 8"/>',
  };
  const icon = (name, className = "") =>
    '<svg class="' +
    className +
    '" viewBox="0 0 24 24" aria-hidden="true">' +
    iconPaths[name] +
    "</svg>";
  const escape = (value) =>
    String(value).replace(
      /[&<>"']/g,
      (character) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[character],
    );
  const safeUrl = (value) => {
    try {
      const url = new URL(value);
      return url.protocol === "https:" ? escape(url.href) : null;
    } catch {
      return null;
    }
  };
  const drawing = (contents) =>
    '<svg class="project-drawing" viewBox="0 0 300 170" aria-hidden="true">' +
    contents +
    "</svg>";
  const windowFrame =
    '<rect x="49" y="28" width="208" height="120" rx="8" fill="#b3b8a5" opacity=".18"/><rect x="43" y="22" width="208" height="120" rx="8" fill="#fffdf5" stroke="#c7cbb9"/><path d="M44 42h206" stroke="#dfe1d5"/><g fill="#a9b199"><circle cx="56" cy="32" r="2"/><circle cx="64" cy="32" r="2"/><circle cx="72" cy="32" r="2"/></g>';
  const cubeFace = (colors, matrix) =>
    '<g transform="matrix(' +
    matrix +
    ')">' +
    colors
      .map(
        (color, index) =>
          '<rect x="' +
          (index % 3) * 18 +
          '" y="' +
          Math.floor(index / 3) * 18 +
          '" width="17" height="17" rx="2" fill="' +
          color +
          '" stroke="#424c40" stroke-width="1.5"/>',
      )
      .join("") +
    "</g>";
  const illustrations = {
    workspace: drawing(
      windowFrame +
        '<rect x="56" y="53" width="40" height="76" rx="4" fill="#e3e8d4"/><path d="M64 63h23m-23 10h17m-17 10h21m-21 10h17" stroke="#a3b093" stroke-width="2"/><g fill="#f1e8d4" stroke="#d2ccb8"><rect x="108" y="55" width="57" height="31" rx="4"/><rect x="175" y="55" width="57" height="31" rx="4"/><rect x="108" y="96" width="57" height="31" rx="4"/><rect x="175" y="96" width="57" height="31" rx="4"/></g><path d="M117 65h26m-26 10h37m30-10h26m-26 10h37m-104 31h26m-26 10h37m30-10h26m-26 10h37" stroke="#a6ac90" stroke-width="2"/>',
    ),
    runtime: drawing(
      '<g fill="none" stroke="#b0bb9f" stroke-width="2"><path d="M58 62h50m84 0h50M58 89h50m84 0h50M58 115h50m84 0h50"/></g><rect x="104" y="43" width="94" height="89" rx="12" fill="#e8edda" stroke="#a7b293"/><rect x="117" y="56" width="68" height="62" rx="6" fill="#596e51"/><path d="m129 87 9-9m-9 9 9 9m33-18 9 9-9 9m-14-25-7 31" fill="none" stroke="#e9efd6" stroke-width="3"/><g fill="#faf9ef" stroke="#b6bfa6"><rect x="35" y="51" width="29" height="23" rx="5"/><rect x="35" y="78" width="29" height="23" rx="5"/><rect x="35" y="105" width="29" height="23" rx="5"/><rect x="237" y="51" width="29" height="23" rx="5"/><rect x="237" y="78" width="29" height="23" rx="5"/><rect x="237" y="105" width="29" height="23" rx="5"/></g><path d="M126 30h48m-38 110h28" stroke="#b99165" stroke-width="4" stroke-linecap="round"/>',
    ),
    market: drawing(
      windowFrame +
        '<path d="M65 62v64h167" stroke="#c6ccba"/><path d="M82 79v36m26-49v36m26-26v41m26-57v31m26-20v40m26-53v26" stroke="#697e5a" stroke-width="2"/><path d="M82 86v21m26-34v22m26-12v24m26-39v16m26-8v25m26-35v14" stroke="#9daf80" stroke-width="10"/><path d="m78 115 27-8 25 8 29-21 26 7 30-14" fill="none" stroke="#bc885c" stroke-width="2"/>',
    ),
    keyboard: drawing(
      '<ellipse cx="151" cy="137" rx="111" ry="11" fill="#93b6a0" opacity=".2"/><g transform="rotate(-4 150 85)"><rect x="41" y="48" width="222" height="82" rx="10" fill="#a9bda8"/><rect x="37" y="42" width="222" height="82" rx="10" fill="#fffbed" stroke="#b9c5ad"/>' +
        Array.from(
          { length: 30 },
          (_, i) =>
            '<rect x="' +
            (50 + (i % 10) * 19.5) +
            '" y="' +
            (53 + Math.floor(i / 10) * 18) +
            '" width="15" height="13" rx="3" fill="' +
            ([13, 16].includes(i) ? "#cc9367" : "#dce6cb") +
            '" stroke="#aebc9c"/>',
        ).join("") +
        '<rect x="100" y="108" width="96" height="9" rx="3" fill="#cbdaba" stroke="#aebc9c"/></g><path d="m244 22 2 7 7 2-7 2-2 7-2-7-7-2 7-2Z" fill="#b48558"/>',
    ),
    "rubiks-cube": drawing(
      '<ellipse cx="150" cy="143" rx="53" ry="7" fill="#8e9271" opacity=".18"/>' +
        cubeFace(
          [
            "#ebd9a3",
            "#ebd9a3",
            "#ebd9a3",
            "#ebd9a3",
            "#ebd9a3",
            "#ebd9a3",
            "#ebd9a3",
            "#c77c55",
            "#ebd9a3",
          ],
          "1 .5 -1 .5 150 23",
        ) +
        cubeFace(
          [
            "#94a879",
            "#94a879",
            "#d4dfc1",
            "#94a879",
            "#94a879",
            "#94a879",
            "#94a879",
            "#94a879",
            "#94a879",
          ],
          "1 .5 0 1 96 50",
        ) +
        cubeFace(
          [
            "#c77c55",
            "#c77c55",
            "#c77c55",
            "#c77c55",
            "#c77c55",
            "#ebd9a3",
            "#c77c55",
            "#c77c55",
            "#c77c55",
          ],
          "1 -.5 0 1 150 77",
        ),
    ),
    "webgpu-demos": drawing(
      windowFrame +
        '<g stroke="#c4d0c2"><rect x="58" y="55" width="54" height="33" rx="4" fill="#e7eddc"/><rect x="121" y="55" width="54" height="33" rx="4" fill="#e6e2ef"/><rect x="184" y="55" width="52" height="33" rx="4" fill="#ead9c5"/><rect x="58" y="97" width="54" height="31" rx="4" fill="#ead9c5"/><rect x="121" y="97" width="54" height="31" rx="4" fill="#e7eddc"/><rect x="184" y="97" width="52" height="31" rx="4" fill="#e6e2ef"/></g><g stroke="#6c8063" fill="none" stroke-width="2"><path d="m77 65 14 7-14 7Z"/><path d="m137 79 6-14 7 13 5-8 6 9M198 67h23m-23 6h15m-15 6h19M71 117l8-9 8 5 10-9M137 107h22v13h-22Z"/><circle cx="210" cy="113" r="8"/></g>',
    ),
    "aquarium-web": drawing(
      '<rect x="41" y="27" width="221" height="113" rx="12" fill="#acbfba" opacity=".3"/><rect x="36" y="22" width="221" height="113" rx="12" fill="#345951" stroke="#6b8b77"/><path d="M39 116q40-21 83 1t133-8v23H39Z" fill="#4d7060"/><g stroke="#93b3a0" fill="none" opacity=".65"><path d="M67 132q-15-25 0-56m-1 30q19-16 11-37m147 61q15-31-2-50"/><circle cx="224" cy="52" r="5"/><circle cx="216" cy="37" r="3"/><circle cx="79" cy="43" r="4"/></g><g fill="#e4bb87"><path d="m126 65-15-10v20Z"/><ellipse cx="143" cy="65" rx="22" ry="12"/><circle cx="154" cy="63" r="2" fill="#345951"/></g><g fill="#c7d6b8"><path d="m196 102 13-9v18Z"/><ellipse cx="183" cy="102" rx="19" ry="10"/><circle cx="172" cy="100" r="2" fill="#345951"/></g><g fill="#dbbba2"><path d="m94 101-10-7v14Z"/><ellipse cx="107" cy="101" rx="16" ry="8"/><circle cx="116" cy="100" r="1.5" fill="#345951"/></g>',
    ),
    "online-toolkit": drawing(
      windowFrame +
        '<rect x="66" y="58" width="47" height="56" rx="5" fill="#ecd6bd"/><rect x="125" y="58" width="47" height="56" rx="5" fill="#dce4d0"/><rect x="184" y="58" width="47" height="56" rx="5" fill="#e0dbea"/><g stroke="#7a7159" stroke-width="2" fill="none"><rect x="77" y="71" width="24" height="27" rx="2"/><path d="m78 94 7-8 5 5 5-5 5 8"/><circle cx="94" cy="78" r="2"/><path d="M136 83v9m5-15v21m6-28v31m5-23v19m5-12v6m37-12-7 8 7 8m16-16 7 8-7 8m-5-18-6 20"/></g><path d="M81 125h16m43 0h16m43 0h16" stroke="#b2b4a3" stroke-width="2"/>',
    ),
    portal: drawing(
      '<g fill="none" stroke="#b2bea3" stroke-width="2"><path d="m71 50 79 34 79-34m-79 34-79 43m79-43 79 43M150 84V28"/><circle cx="150" cy="84" r="48" stroke-dasharray="3 5"/></g><g fill="#faf9ed" stroke="#b0b99e"><rect x="119" y="57" width="62" height="53" rx="7"/><rect x="57" y="37" width="28" height="26" rx="5"/><rect x="215" y="37" width="28" height="26" rx="5"/><rect x="57" y="114" width="28" height="26" rx="5"/><rect x="215" y="114" width="28" height="26" rx="5"/><circle cx="150" cy="27" r="8"/></g><path d="M120 70h60m-51 10h18v20h-18m24-20h18m-18 8h18m-18 8h12M65 46h12m-12 7h8m151-7h11m-11 7h8m-160 69h12m-12 7h8m151-7h11m-11 7h8" fill="none" stroke="#82956d" stroke-width="2"/>',
    ),
    reading: drawing(
      windowFrame +
        '<rect x="57" y="54" width="44" height="74" rx="3" fill="#e3e7d6"/><path d="M66 65h25m-25 10h19m-19 10h23m-23 10h16" stroke="#a1ad8c" stroke-width="2"/><rect x="112" y="55" width="122" height="21" rx="3" fill="#f0e5d2"/><rect x="112" y="83" width="122" height="21" rx="3" fill="#eff0e6"/><path d="M121 63h97m-97 6h62m-62 23h97m-97 6h71m-80 17h104m-104 7h80" stroke="#aeb599" stroke-width="2"/><circle cx="222" cy="119" r="12" fill="#657653"/><path d="m217 119 4 4 6-8" stroke="#fffdf5" stroke-width="2" fill="none"/>',
    ),
    painting: drawing(
      '<path d="m65 133-9 10h186l-8-10" fill="#ccb79c" opacity=".25"/><rect x="70" y="24" width="160" height="116" rx="2" fill="#c5a774" stroke="#aa8a5c"/><rect x="78" y="32" width="144" height="100" fill="#f1e7d1"/><rect x="88" y="42" width="124" height="80" fill="#8a9a82"/><circle cx="180" cy="60" r="9" fill="#e5cb8f"/><path d="m88 97 32-38 34 31 21-18 37 32v18H88Z" fill="#596f5b"/><path d="m88 113 41-30 43 24 40-15v30H88Z" fill="#b8bc95"/><path d="M153 99q-10 11 11 23h22q-26-11-25-20Z" fill="#e2d8b7"/><path d="M101 34h96M83 47v69" stroke="#fff9e6" opacity=".7"/>',
    ),
    gpumark: drawing(
      '<g stroke="#b8c5a9" stroke-width="3"><path d="M101 45V29m20 16V29m20 16V29m20 16V29m20 16V29m20 16V29M101 127v16m20-16v16m20-16v16m20-16v16m20-16v16m20-16v16M90 57H74m16 19H74m16 19H74m16 19H74m136-57h16m-16 19h16m-16 19h16m-16 19h16"/></g><rect x="89" y="44" width="122" height="84" rx="7" fill="#53694e" stroke="#8a9d79"/><rect x="102" y="56" width="96" height="59" rx="3" fill="#344a35"/><path d="M116 102V89m17 13V80m17 22V70m17 32V85m17 17V66" stroke="#b9c796" stroke-width="8"/><path d="M110 105h82" stroke="#8a9d79"/>',
    ),
    "pantheon-toolkit": drawing(
      windowFrame +
        '<path d="M72 63v60h152" stroke="#c6ccba"/><rect x="89" y="90" width="17" height="32" rx="2" fill="#b5c6a3"/><rect x="120" y="73" width="17" height="49" rx="2" fill="#859d70"/><rect x="151" y="82" width="17" height="40" rx="2" fill="#d4ab88"/><rect x="182" y="60" width="17" height="62" rx="2" fill="#718d64"/><path d="m93 76 33-21 31 13 32-23" stroke="#ae784f" stroke-width="2" fill="none"/><circle cx="220" cy="109" r="15" fill="#ebdfc9" stroke="#c6b18d"/><path d="M220 101v14m-5-5 5 5 5-5" fill="none" stroke="#8c6e48" stroke-width="2"/>',
    ),
    score:
      '<i class="score-confetti"></i><i class="score-confetti two"></i><div class="mini-scoreboard"><div class="board-top"><span>FRIENDLY MATCH</span><span>ROUND 03</span></div><div class="board-scores"><b>21</b><span>:</span><b>19</b></div><div class="board-bottom"><span>TEAM A</span><span>GOOD GAME.</span><span>TEAM B</span></div></div>',
    lexicon:
      '<div class="mini-dictionary"><div class="dictionary-top"><span>LEXI / WORD OF THE DAY</span><span>⌕</span></div><div class="dictionary-word">serendipity<span>n.</span></div><div class="dictionary-definition">不期而遇的美好 · an unexpected delight</div><i class="dictionary-tab"></i></div>',
    tank: '<div class="tank-grid"></div><div class="tank-reticle"></div><svg class="tank-map" viewBox="0 0 240 164"><g fill="#707b56"><path d="m33 43 25-13 21 10-26 14Z"/><path d="m33 43 20 11v18L33 62Z" fill="#535e40"/><path d="m53 54 26-14v19L53 72Z" fill="#626c49"/><path d="m164 114 27-15 21 11-28 15Z"/><path d="m164 114 20 11v14l-20-11Z" fill="#525b41"/><path d="m184 125 28-15v14l-28 15Z" fill="#626c49"/></g><g transform="translate(85 39) rotate(-25 36 41)"><rect x="0" y="17" width="16" height="71" rx="5" fill="#242c23"/><rect x="55" y="17" width="16" height="71" rx="5" fill="#242c23"/><path d="M4 25h8m-8 10h8m-8 10h8m-8 10h8m-8 10h8m-8 10h8m47-50h8m-8 10h8m-8 10h8m-8 10h8m-8 10h8m-8 10h8" stroke="#596248" stroke-width="3"/><rect x="13" y="20" width="45" height="65" rx="6" fill="#879067"/><rect x="17" y="22" width="37" height="8" rx="2" fill="#a3ac7e"/><path d="M18 74h35" stroke="#67744b" stroke-width="4"/><rect x="22" y="39" width="28" height="30" rx="6" fill="#afb58a"/><path d="M26 65h20" stroke="#8d966c" stroke-width="3"/><rect x="32" y="4" width="8" height="45" rx="2" fill="#c6c5a1"/><rect x="30" y="2" width="12" height="10" rx="2" fill="#a9ae85"/><circle cx="36" cy="56" r="5" fill="#929b6c"/></g><circle cx="186" cy="42" r="3" fill="#cc9569"/><path d="m181 42-7 4m12-9 1-8" stroke="#cc9569" stroke-width="1" opacity=".6"/><path d="m51 115 10 5 10-5-10-5Z" fill="#b88760" opacity=".6"/></svg>',
    book:
      '<i class="book-leaf"></i><div class="mini-book"><div class="book-page"><div class="book-character"><span>温</span><span>故</span></div></div><div class="book-page right"><div class="memory-label">LITTLE BY LITTLE</div><div class="memory-grid">' +
      "<i></i>".repeat(20) +
      '</div><div class="memory-caption">EVERY DAY COUNTS</div></div></div>',
    memory:
      '<svg class="memory-network" viewBox="0 0 265 160"><g stroke="#bbb3cf" stroke-width="1" fill="none"><path d="m43 53 88 26 83-39M50 113l81-34 86 29M131 79l-20-56m20 56 42 64" stroke-dasharray="3 4"/><circle cx="132" cy="79" r="51" stroke="#d0cadc"/><circle cx="132" cy="79" r="70" stroke="#d8d2e3"/></g><g fill="#f8f5fc" stroke="#c6bdd6" stroke-width="1"><rect x="31" y="42" width="24" height="24" rx="6" transform="rotate(-9 43 54)"/><rect x="202" y="28" width="24" height="24" rx="6" transform="rotate(9 214 40)"/><rect x="37" y="102" width="24" height="24" rx="6" transform="rotate(7 49 114)"/><rect x="205" y="97" width="24" height="24" rx="6" transform="rotate(-6 217 109)"/><circle cx="111" cy="23" r="6"/><circle cx="173" cy="143" r="4"/></g><g stroke="#a497b8" stroke-width="1.4" fill="none"><path d="M39 52h8m-8 4h5m160-16h12m-6-6v12m-174 70 5-6 5 6m155-6 5 4 6-8"/></g></svg><div class="memory-core"><span>g<span>·</span>1</span></div><div class="network-caption">CONNECT → REMEMBER → GROW</div>',
    handwriting:
      '<div class="writing-paper"><div class="writing-cell"><span>山</span></div><div class="writing-cell"><span>水</span></div><div class="writing-cell"><span>间</span></div><span class="writing-stamp">手作</span></div><div class="writing-brush"></div>',
  };

  const guestCatalogue = publicProjects
    .filter(isGuestVisible)
    .map(toGuestProject);
  let projects = [...guestCatalogue];
  const grid = document.querySelector("#project-grid");
  const search = document.querySelector("#project-search");
  const openedPlans = new Set();
  let activeFilter = "all";
  let toastTimer;
  let language;
  let signedIn = false;
  let authVersion = 0;
  let expiryTimer;
  const orderPreferences = {};
  let draggingId = null;
  let pendingOrder = null;
  let savingOrder = false;
  let orderSaveFailed = false;
  const orderKey = () =>
    "portfolio-project-order:" + (signedIn ? "gyagp" : "guest");
  function currentOrder() {
    const key = orderKey();
    if (!orderPreferences[key]) {
      let saved;
      try {
        if (!signedIn) saved = JSON.parse(localStorage.getItem(key));
      } catch {
        /* Use the default order. */
      }
      orderPreferences[key] = {
        guest: Array.isArray(saved?.guest)
          ? saved.guest.filter((id) => typeof id === "string").slice(0, 1000)
          : [],
        personal: Array.isArray(saved?.personal)
          ? saved.personal.filter((id) => typeof id === "string").slice(0, 1000)
          : [],
        pinned: Array.isArray(saved?.pinned)
          ? saved.pinned.filter((id) => typeof id === "string").slice(0, 1000)
          : [],
      };
    }
    return orderPreferences[key];
  }
  function orderedGroup(items, groupName) {
    const positions = new Map(
      currentOrder()[groupName].map((id, index) => [id, index]),
    );
    return [...items].sort(
      (a, b) =>
        Number(isPinned(b.id)) - Number(isPinned(a.id)) ||
        (positions.get(a.id) ?? Infinity) - (positions.get(b.id) ?? Infinity) ||
        (a.order ?? 0) - (b.order ?? 0),
    );
  }
  function isPinned(id) {
    return currentOrder().pinned.includes(id);
  }
  function saveOrder() {
    if (signedIn) {
      pendingOrder = structuredClone(currentOrder());
      void flushOrder();
      return;
    }
    try {
      localStorage.setItem(orderKey(), JSON.stringify(currentOrder()));
    } catch {
      /* In-memory preferences remain available. */
    }
  }
  function updateOrderStatus() {
    const t = translations[language];
    document.querySelector("[data-i18n='orderHint']").textContent = signedIn
      ? t.orderHintServer
      : t.orderHint;
    document.querySelector("#order-save-bar").hidden = !signedIn;
    document.querySelector("#order-save-status").textContent =
      t[
        savingOrder
          ? "savingOrder"
          : orderSaveFailed
            ? "saveOrderError"
            : "savedOrder"
      ];
    document.querySelector("#retry-order").hidden =
      !orderSaveFailed || savingOrder;
  }
  async function flushOrder() {
    if (savingOrder || !signedIn || !pendingOrder) return;
    savingOrder = true;
    orderSaveFailed = false;
    updateOrderStatus();
    try {
      while (signedIn && pendingOrder) {
        const value = pendingOrder;
        pendingOrder = null;
        try {
          await authRequest("preferences", { preferences: value }, "PUT");
        } catch (error) {
          if (error.message === "unauthorized") {
            applySession({ authenticated: false });
            showToast(translations[language].sessionExpired);
          } else if (signedIn) {
            pendingOrder = pendingOrder || value;
            orderSaveFailed = true;
          }
          break;
        }
      }
    } finally {
      savingOrder = false;
      updateOrderStatus();
    }
  }
  function togglePin(id) {
    const project = projects.find((item) => item.id === id);
    if (!project || (!isGuestVisible(project) && !signedIn)) return;
    const pinned = !isPinned(id);
    currentOrder().pinned = pinned
      ? [...currentOrder().pinned, id]
      : currentOrder().pinned.filter((item) => item !== id);
    saveOrder();
    renderProjects();
    document
      .getElementById("project-" + id)
      ?.querySelector("[data-pin-project]")
      ?.focus({ preventScroll: true });
    showToast(
      project.name[language] +
        " · " +
        translations[language][pinned ? "pinUpdated" : "unpinUpdated"],
    );
  }
  function moveProject(id, targetId) {
    const source = projects.find((project) => project.id === id);
    const target = projects.find((project) => project.id === targetId);
    if (
      !source ||
      !target ||
      id === targetId ||
      isGuestVisible(source) !== isGuestVisible(target)
    )
      return;
    if (isPinned(id) !== isPinned(targetId)) return;
    if (!isGuestVisible(source) && !signedIn) return;
    const groupName = isGuestVisible(source) ? "guest" : "personal";
    const group = orderedGroup(
      projects.filter(
        (project) => isGuestVisible(project) === isGuestVisible(source),
      ),
      groupName,
    );
    const from = group.findIndex((project) => project.id === id);
    const to = group.findIndex((project) => project.id === targetId);
    group.splice(to, 0, group.splice(from, 1)[0]);
    currentOrder()[groupName] = group.map((project) => project.id);
    saveOrder();
    renderProjects();
    document
      .getElementById("project-" + id)
      ?.querySelector("[data-drag-project]")
      ?.focus({ preventScroll: true });
    showToast(
      source.name[language] + " · " + translations[language].orderUpdated,
    );
  }
  const loginDialog = document.querySelector("#login-dialog");
  const authButton = document.querySelector("#auth-button");
  let authChannel;
  try {
    authChannel = new BroadcastChannel("portfolio-session");
  } catch {
    /* Optional cross-tab refresh. */
  }

  function showToast(message) {
    const toast = document.querySelector("#toast");
    toast.textContent = message;
    toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.hidden = true;
    }, 4000);
  }

  function updateAuthUI() {
    document.querySelector("#auth-user").hidden = !signedIn;
    document.querySelector("#auth-button-label").textContent =
      translations[language][signedIn ? "logout" : "login"];
  }

  function applySession(data) {
    clearTimeout(expiryTimer);
    signedIn = data.authenticated === true && data.user === "gyagp";
    projects = Array.isArray(data.projects)
      ? signedIn
        ? data.projects
        : data.projects.filter(isGuestVisible).map(toGuestProject)
      : [...guestCatalogue];
    if (!signedIn) {
      openedPlans.clear();
      pendingOrder = null;
      orderSaveFailed = false;
      delete orderPreferences["portfolio-project-order:gyagp"];
    } else if (data.preferences && !savingOrder && !pendingOrder) {
      orderPreferences["portfolio-project-order:gyagp"] = data.preferences;
    }
    updateAuthUI();
    renderProjects();
    updateOrderStatus();
    if (signedIn && data.expiresAt) {
      expiryTimer = setTimeout(
        () => {
          authVersion++;
          applySession({ authenticated: false });
          showToast(translations[language].sessionExpired);
        },
        Math.max(0, data.expiresAt - Date.now()),
      );
    }
  }

  async function authRequest(route, body, method) {
    const response = await fetch("/api/" + route, {
      method: method || (body === undefined ? "GET" : "POST"),
      credentials: "same-origin",
      cache: "no-store",
      ...(body === undefined
        ? {}
        : {
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          }),
    });
    let data;
    try {
      data = await response.json();
    } catch {
      throw new Error("unavailable");
    }
    if (!response.ok) throw new Error(data.error || "unavailable");
    return data;
  }

  async function refreshSession() {
    const version = ++authVersion;
    try {
      const data = await authRequest("projects");
      if (version === authVersion) applySession(data);
    } catch {
      if (version === authVersion) applySession({ authenticated: false });
    }
  }

  function preferredLanguage() {
    const urlLanguage = new URLSearchParams(location.search).get("lang");
    if (["zh", "en"].includes(urlLanguage)) return urlLanguage;
    try {
      const saved = localStorage.getItem("portfolio-language");
      if (["zh", "en"].includes(saved)) return saved;
    } catch {
      /* Storage may be unavailable; the page still works. */
    }
    return navigator.language.toLowerCase().startsWith("zh") ? "zh" : "en";
  }

  function renderProjects() {
    const t = translations[language];
    const categories = new Set(projects.map((project) => project.category));
    if (activeFilter !== "all" && !categories.has(activeFilter))
      activeFilter = "all";
    document.querySelectorAll("[data-count]").forEach((element) => {
      element.textContent = projects.filter(
        (project) =>
          element.dataset.count === "all" ||
          project.category === element.dataset.count,
      ).length;
    });
    document.querySelector("#project-total").textContent = String(
      projects.length,
    ).padStart(2, "0");
    document.querySelectorAll("[data-filter]").forEach((button) => {
      button.hidden =
        button.dataset.filter !== "all" &&
        !categories.has(button.dataset.filter);
      button.classList.toggle("active", button.dataset.filter === activeFilter);
      button.setAttribute(
        "aria-pressed",
        String(button.dataset.filter === activeFilter),
      );
    });
    const query = search.value.trim().toLocaleLowerCase();
    const guestProjects = orderedGroup(
      projects.filter(isGuestVisible),
      "guest",
    );
    const personalProjects = signedIn
      ? orderedGroup(
          projects.filter((project) => !isGuestVisible(project)),
          "personal",
        )
      : [];
    const visible = [...guestProjects, ...personalProjects].filter(
      (project) => {
        const searchable = [
          project.id,
          project.name.zh,
          project.name.en,
          project.description.zh,
          project.description.en,
          ...project.tags.zh,
          ...project.tags.en,
          project.repo,
        ]
          .join(" ")
          .toLocaleLowerCase();
        return (
          (activeFilter === "all" || project.category === activeFilter) &&
          searchable.includes(query)
        );
      },
    );
    const guestVisible = visible.filter(isGuestVisible);
    const personalVisible = signedIn
      ? visible.filter((project) => !isGuestVisible(project))
      : [];
    const renderCard = (project) => {
      const dateMarkup = (value) => {
        const date = new Date(value || "");
        return Number.isNaN(date.getTime())
          ? t.datePending
          : '<time datetime="' +
              escape(value) +
              '">' +
              date.toISOString().slice(0, 10) +
              "</time>";
      };
      const name = project.name[language];
      const isPrivate = project.visibility === "private";
      const visibility = ["public", "private", "restricted"].includes(
        project.visibility,
      )
        ? project.visibility
        : "unknown";
      const repoNote =
        project.visibility === "restricted"
          ? t.enterprise
          : isPrivate
            ? t.codeAccess
            : visibility === "unknown"
              ? t.codeUnverified
              : "";
      const repoUrl = safeUrl(project.repo);
      const releaseUrl = project.release && safeUrl(project.release.url);
      const futureItems = project.future[language];
      const group = isGuestVisible(project) ? guestProjects : personalProjects;
      const index = String(group.indexOf(project) + 1).padStart(2, "0");
      const projectId = escape(project.id);
      const pinned = isPinned(project.id);
      const visibleGroup = (
        isGuestVisible(project) ? guestVisible : personalVisible
      ).filter((item) => isPinned(item.id) === pinned);
      const visiblePosition = visibleGroup.indexOf(project);
      const orderControls =
        '<div class="order-controls" role="group" aria-label="' +
        escape(name + " · " + t.reorder) +
        '">' +
        '<button type="button" data-pin-project="' +
        projectId +
        '" aria-pressed="' +
        pinned +
        '" aria-label="' +
        escape(name + " · " + (pinned ? t.unpinProject : t.pinProject)) +
        '" title="' +
        (pinned ? t.unpinProject : t.pinProject) +
        '">' +
        icon("pin") +
        "</button>" +
        '<button type="button" class="drag-handle" draggable="true" data-drag-project="' +
        projectId +
        '" aria-label="' +
        escape(name + " · " + t.dragProject) +
        '" title="' +
        t.dragProject +
        '">' +
        icon("grip") +
        "</button>" +
        '<button type="button" data-order-up="' +
        projectId +
        '" aria-label="' +
        escape(name + " · " + t.moveUp) +
        '" title="' +
        t.moveUp +
        '"' +
        (visiblePosition === 0 ? " disabled" : "") +
        ">" +
        icon("up") +
        "</button>" +
        '<button type="button" data-order-down="' +
        projectId +
        '" aria-label="' +
        escape(name + " · " + t.moveDown) +
        '" title="' +
        t.moveDown +
        '"' +
        (visiblePosition === visibleGroup.length - 1 ? " disabled" : "") +
        ">" +
        icon("down") +
        "</button></div>";
      const artKey = project.art || project.id;
      const repoLink = repoUrl
        ? '<a class="repo-link" href="' +
          repoUrl +
          '" target="_blank" rel="noopener noreferrer" aria-label="' +
          escape(
            name + " · " + t.repoLabel + (repoNote ? " · " + repoNote : ""),
          ) +
          '" title="' +
          escape(repoNote || project.repo) +
          '">' +
          icon("code") +
          (visibility === "unknown" ? t.codeUnknown : t.code) +
          "</a>"
        : '<span class="release-unavailable">' +
          icon("lock") +
          (isPrivate ? t.private : t.code) +
          "</span>";
      const releaseLink = releaseUrl
        ? '<a class="release-link" href="' +
          releaseUrl +
          '" target="_blank" rel="noopener noreferrer" aria-label="' +
          escape(
            name +
              " · " +
              t.releaseLabel +
              (project.release.access === "restricted"
                ? " · " + t.restricted
                : ""),
          ) +
          '">' +
          (project.release.kind === "download"
            ? t.download + icon("download")
            : (project.release.kind === "deployment" ? t.deployment : t.visit) +
              icon("arrow")) +
          "</a>"
        : '<span class="release-unavailable">' +
          icon(project.releaseState === "private" ? "lock" : "clock") +
          (t[
            project.releaseState === "private"
              ? "privateRelease"
              : project.releaseState
          ] || t.unlisted) +
          "</span>";
      const releaseNote =
        releaseUrl && project.release.access !== "public"
          ? t[project.release.access] || ""
          : "";
      const futureSource = safeUrl(project.futureSource);
      const futureBody =
        (futureItems.length
          ? "<ul>" +
            futureItems
              .map((item) => "<li>" + escape(item) + "</li>")
              .join("") +
            "</ul>"
          : "<p>" + t.futureEmpty + "</p>") +
        (futureSource
          ? '<a class="future-source" href="' +
            futureSource +
            '" target="_blank" rel="noopener noreferrer">' +
            t.futureSourceLabel +
            "</a>"
          : "");
      return (
        '<article class="project-card' +
        (pinned ? " is-pinned" : "") +
        '" data-pinned="' +
        pinned +
        '" id="project-' +
        projectId +
        '" aria-labelledby="title-' +
        projectId +
        '">' +
        orderControls +
        (pinned
          ? '<span class="pinned-label">' + icon("pin") + t.pinned + "</span>"
          : "") +
        '<div class="project-art art-' +
        escape(artKey) +
        '" aria-hidden="true"><span class="art-index">' +
        index +
        " / " +
        escape(project.id.toUpperCase()) +
        '</span><span class="art-decoration">↗</span>' +
        (illustrations[artKey] ||
          '<div class="memory-core"><span>↗</span></div>') +
        '<span class="art-label">' +
        escape(project.subtitle) +
        "</span></div>" +
        '<div class="card-content"><div class="card-title-row"><h4 class="project-title" id="title-' +
        projectId +
        '">' +
        escape(name) +
        '</h4><span class="visibility ' +
        visibility +
        '">' +
        icon(
          isPrivate || visibility === "restricted"
            ? "lock"
            : visibility === "public"
              ? "globe"
              : "clock",
        ) +
        (visibility === "restricted" ? t.enterpriseCode : t[visibility]) +
        "</span></div>" +
        '<p class="card-description">' +
        escape(project.description[language]) +
        "</p>" +
        '<div class="project-tags">' +
        project.tags[language]
          .map((tag) => "<span>" + escape(tag) + "</span>")
          .join("") +
        "</div>" +
        '<div class="project-dates"><span>' +
        t.started +
        " " +
        dateMarkup(project.createdAt) +
        "</span><span>" +
        t.updated +
        " " +
        dateMarkup(project.updatedAt) +
        "</span></div>" +
        '<div class="card-actions">' +
        repoLink +
        releaseLink +
        '</div><p class="release-note">' +
        escape(releaseNote) +
        "</p>" +
        '<details class="future-work" data-project="' +
        projectId +
        '"' +
        (openedPlans.has(project.id) ? " open" : "") +
        ">" +
        '<summary aria-label="' +
        escape(name + " · " + t.future) +
        '"><span>' +
        icon("future") +
        t.future +
        '</span><span class="future-state">' +
        (futureItems.length
          ? futureItems.length + " " + t.futureListed
          : t.futurePending) +
        "</span>" +
        icon("chevron", "chevron") +
        "</summary>" +
        '<div class="future-body">' +
        futureBody +
        "</div></details></div></article>"
      );
    };
    grid.innerHTML = guestVisible.map(renderCard).join("");
    document.querySelector("#personal-project-grid").innerHTML = personalVisible
      .map(renderCard)
      .join("");
    document.querySelector("#guest-project-total").textContent = String(
      guestProjects.length,
    ).padStart(2, "0");
    document.querySelector("#personal-project-total").textContent = signedIn
      ? String(personalProjects.length).padStart(2, "0")
      : "";
    document.querySelector("#guest-projects").hidden = visible.length === 0;
    document.querySelector("#personal-projects").hidden =
      !signedIn || personalProjects.length === 0 || visible.length === 0;
    document.querySelector("#guest-projects-empty").hidden =
      guestVisible.length > 0;
    document.querySelector("#personal-projects-empty").hidden =
      personalVisible.length > 0;
    document.querySelector("#empty-state").hidden = visible.length > 0;
    document.querySelector("#result-count").textContent =
      visible.length + " " + t.results;
    document.querySelectorAll(".project-grid details").forEach((details) => {
      details.addEventListener("toggle", () => {
        if (details.open) openedPlans.add(details.dataset.project);
        else openedPlans.delete(details.dataset.project);
      });
    });
  }

  function setLanguage(next, persist = false) {
    language = next;
    const t = translations[language];
    document.documentElement.lang = language === "zh" ? "zh-CN" : "en";
    document.title = t.title;
    document.querySelector('meta[name="description"]').content =
      t.metaDescription;
    document.querySelector('meta[property="og:title"]').content = t.title;
    document.querySelector('meta[property="og:description"]').content =
      t.metaDescription;
    document.querySelectorAll("[data-i18n]").forEach((element) => {
      element.textContent = t[element.dataset.i18n];
    });
    for (const [dataAttribute, attribute] of [
      ["data-i18n-aria", "aria-label"],
      ["data-i18n-placeholder", "placeholder"],
      ["data-i18n-title", "title"],
    ]) {
      document
        .querySelectorAll("[" + dataAttribute + "]")
        .forEach((element) => {
          element.setAttribute(
            attribute,
            t[element.getAttribute(dataAttribute)],
          );
        });
    }
    document.querySelectorAll("[data-language]").forEach((button) => {
      button.setAttribute(
        "aria-pressed",
        String(button.dataset.language === language),
      );
    });
    document.querySelector("#toast").hidden = true;
    updateAuthUI();
    updateOrderStatus();
    document.querySelector("#login-error").hidden = true;
    renderProjects();
    if (persist) {
      try {
        localStorage.setItem("portfolio-language", language);
      } catch {
        /* Optional preference. */
      }
      const url = new URL(location.href);
      url.searchParams.set("lang", language);
      try {
        history.replaceState(null, "", url);
      } catch {
        /* Also supports direct file previews. */
      }
    }
  }

  function setFilter(next) {
    activeFilter = next;
    document.querySelectorAll("[data-filter]").forEach((button) => {
      const selected = button.dataset.filter === next;
      button.classList.toggle("active", selected);
      button.setAttribute("aria-pressed", String(selected));
    });
    renderProjects();
  }

  document.querySelectorAll("[data-language]").forEach((button) => {
    button.addEventListener("click", () =>
      setLanguage(button.dataset.language, true),
    );
  });
  document.querySelectorAll("[data-filter]").forEach((button) => {
    button.addEventListener("click", () => setFilter(button.dataset.filter));
  });
  document.querySelector("#reset-order").addEventListener("click", () => {
    orderPreferences[orderKey()] = { guest: [], personal: [], pinned: [] };
    saveOrder();
    renderProjects();
    showToast(translations[language].orderReset);
  });
  document.querySelector("#retry-order").addEventListener("click", flushOrder);
  window.addEventListener("online", flushOrder);
  for (const projectGrid of document.querySelectorAll(".project-grid")) {
    projectGrid.addEventListener("click", (event) => {
      const pinButton = event.target.closest("[data-pin-project]");
      if (pinButton) {
        togglePin(pinButton.dataset.pinProject);
        return;
      }
      const button = event.target.closest("[data-order-up], [data-order-down]");
      if (!button || button.disabled) return;
      const id = button.dataset.orderUp || button.dataset.orderDown;
      const ids = [...projectGrid.querySelectorAll(".project-card")]
        .filter((card) => card.dataset.pinned === String(isPinned(id)))
        .map((card) => card.id.slice("project-".length));
      const index = ids.indexOf(id);
      moveProject(
        id,
        ids[index + (button.hasAttribute("data-order-up") ? -1 : 1)],
      );
    });
    projectGrid.addEventListener("dragstart", (event) => {
      const handle = event.target.closest("[data-drag-project]");
      if (!handle) return;
      draggingId = handle.dataset.dragProject;
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", draggingId);
      handle.closest(".project-card").classList.add("is-dragging");
    });
    projectGrid.addEventListener("dragover", (event) => {
      const card = event.target.closest(".project-card");
      if (
        !draggingId ||
        !card ||
        !projectGrid.querySelector(
          '[data-drag-project="' + CSS.escape(draggingId) + '"]',
        )
      )
        return;
      if (isPinned(draggingId) !== isPinned(card.id.slice("project-".length)))
        return;
      event.preventDefault();
      event.dataTransfer.dropEffect = "move";
      document
        .querySelectorAll(".is-drop-target")
        .forEach((item) => item.classList.remove("is-drop-target"));
      card.classList.add("is-drop-target");
    });
    projectGrid.addEventListener("drop", (event) => {
      const card = event.target.closest(".project-card");
      if (!draggingId || !card) return;
      event.preventDefault();
      moveProject(draggingId, card.id.slice("project-".length));
      draggingId = null;
    });
    projectGrid.addEventListener("dragend", () => {
      draggingId = null;
      document
        .querySelectorAll(".is-dragging, .is-drop-target")
        .forEach((card) =>
          card.classList.remove("is-dragging", "is-drop-target"),
        );
    });
  }
  window.addEventListener("storage", (event) => {
    if (!signedIn && event.key === orderKey()) {
      delete orderPreferences[orderKey()];
      renderProjects();
    }
  });
  document.querySelector("#year").textContent = new Date().getFullYear();
  search.addEventListener("input", renderProjects);
  document.querySelector("#reset-filters").addEventListener("click", () => {
    search.value = "";
    setFilter("all");
    search.focus();
  });
  document.querySelector("#copy-email").addEventListener("click", async () => {
    let message;
    try {
      await navigator.clipboard.writeText("gyagp0@gmail.com");
      message = translations[language].copied;
    } catch {
      const range = document.createRange();
      range.selectNodeContents(
        document.querySelector(".email-row a").firstChild,
      );
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      message = translations[language].copyFallback;
    }
    const toast = document.querySelector("#toast");
    toast.textContent = message;
    toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.hidden = true;
    }, 3500);
  });
  window.addEventListener("popstate", () => setLanguage(preferredLanguage()));
  authButton.addEventListener("click", async () => {
    if (!signedIn) {
      document.querySelector("#login-error").hidden = true;
      loginDialog.showModal();
      document.querySelector("#login-password").focus();
      return;
    }
    const version = ++authVersion;
    authButton.disabled = true;
    try {
      const data = await authRequest("logout", {});
      if (version === authVersion) {
        applySession(data);
        showToast(translations[language].logoutSuccess);
        authChannel?.postMessage("changed");
      }
    } catch {
      showToast(translations[language].unavailable);
    } finally {
      authButton.disabled = false;
    }
  });
  document
    .querySelector("#close-login")
    .addEventListener("click", () => loginDialog.close());
  loginDialog.addEventListener("close", () => {
    document.querySelector("#login-password").value = "";
  });
  document
    .querySelector("#login-form")
    .addEventListener("submit", async (event) => {
      event.preventDefault();
      const version = ++authVersion;
      const submit = document.querySelector("#login-submit");
      const error = document.querySelector("#login-error");
      error.hidden = true;
      submit.disabled = true;
      try {
        const data = await authRequest("login", {
          username: document.querySelector("#login-username").value.trim(),
          password: document.querySelector("#login-password").value,
        });
        if (version === authVersion) {
          applySession(data);
          loginDialog.close();
          showToast(translations[language].loginSuccess);
          authChannel?.postMessage("changed");
        }
      } catch (failure) {
        if (version === authVersion) {
          error.textContent =
            translations[language][failure.message] ||
            translations[language].unavailable;
          error.hidden = false;
          document.querySelector("#login-password").value = "";
          document.querySelector("#login-password").focus();
        }
      } finally {
        submit.disabled = false;
      }
    });
  if (authChannel) authChannel.onmessage = refreshSession;
  window.addEventListener("pageshow", (event) => {
    if (event.persisted) {
      applySession({ authenticated: false });
      refreshSession();
    }
  });
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) refreshSession();
  });
  setLanguage(preferredLanguage());
  refreshSession();
})();
