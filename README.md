# Frame UI

개인 프로젝트에서 재사용하고 직접 커스텀할 수 있도록 React와 StyleX로 만드는 UI kit입니다.

현재는 **패키지와 Storybook 검증 환경을 구성하는 단계**입니다. 공개 컴포넌트와 디자인 토큰은 아직 없으며,
Storybook의 Internal fixture는 테스트 환경 확인용입니다. 실제 Vite·Next.js 소비 예제는 후속 이슈에서 추가합니다.

## 개발 환경

- Node.js 24 LTS를 기준으로 개발합니다. 지원 최소 버전은 24.0이며 개발·CI 버전은 `.node-version`의 `24.21.0`으로 고정합니다.
- pnpm 12.3.4 (`packageManager`에 고정)
- React 19, TypeScript 7, StyleX 0.19, Vite 8

`@types/node`는 Node 24 계열의 최신 버전을 사용합니다. `unplugin`은
`@stylexjs/unplugin`의 peer 요구사항에 맞는 2.x 계열의 최신 버전을 사용합니다.

CI는 [Nodeup의 GitHub Actions 설치 예제](https://nodeup.delino.io/installation#github-actions)에 따라
`taiki-e/install-action`과 `cargo-binstall`로 Nodeup 0.2.0을 설치합니다.
Nodeup으로 Node.js를 선택하고, `packageManager`에 고정한 pnpm을 실행합니다.
로컬에서 Nodeup을 사용한다면 설치 후 shim 디렉터리를 `PATH`의 앞에 둔 상태에서
아래 명령을 실행합니다. Nodeup은 `.node-version`을 자동으로 읽지 않으므로 디렉터리별
override에 버전을 지정합니다.

```sh
nodeup override set "$(cat .node-version)"
pnpm install --frozen-lockfile
pnpm check
```

`pnpm check`는 소스·빌드·Storybook 설정 타입 검사와 패키지 빌드를 순서대로 실행합니다.
소스 JSX 변환과 StyleX CSS 추출은 공식 `@stylexjs/unplugin`을 적용한 Vite library build가
담당하고, 타입 선언은 TypeScript가 별도로 생성합니다.
`build/entry.ts`에서 CSS를 가져와 추출하고 타입 선언은 `src`에서만 생성하므로,
소비 앱의 타입 검사에 CSS 모듈 선언을 요구하지 않습니다.

| 명령 | 결과 |
| --- | --- |
| `pnpm typecheck` | 소스·빌드 진입점·Vite·Storybook 설정 타입 검사 |
| `pnpm build` | `dist/index.js`, 타입 선언, `dist/styles.css` 생성 |
| `pnpm pack` | 빌드 후 로컬 tarball 생성. 레지스트리에 게시하지 않음 |

## 패키지 계약

개발용 패키지명은 `frame-ui`이며 `private: true`로 게시를 막아두었습니다.
레지스트리 이름 확보와 npm 배포는 별도 작업입니다.

| 진입점 | 용도 |
| --- | --- |
| `frame-ui` | 향후 UI 컴포넌트가 노출될 ESM 진입점. 현재 공개 export 없음 |
| `frame-ui/styles.css` | 소비 앱에서 명시적으로 import할 CSS |

CSS는 앱 진입점이나 Next.js 루트 layout에서 한 번 가져옵니다.

```ts
import 'frame-ui/styles.css';
```

현재 CSS에는 레이어 선언만 있습니다. Frame UI의 디자인 토큰과 컴포넌트 스타일은 후속 이슈에서
추가합니다. React·ReactDOM·StyleX는 peer dependency로 두고 번들에 포함하지 않습니다.
Tailwind는 사용하지 않습니다.

컴포넌트 진입점의 출력에는 `"use client"`를 유지합니다. 향후 서버에서 읽을 토큰 메타데이터를
추가할 때는 이 client 진입점과 분리해야 합니다. Next.js SSR·hydration 전체 호환성은
후속 이슈 #7에서 검증합니다.

실제 패키지 소비와 Next.js SSR·hydration은 아래 후속 이슈에서 검증합니다.

## Storybook과 브라우저 검사

```sh
pnpm install --frozen-lockfile
pnpm exec playwright install chromium # Linux CI: --with-deps chromium
pnpm storybook                       # http://localhost:6006
pnpm build:storybook                 # storybook-static/
pnpm test:storybook                  # Chromium: play + addon-a11y, watch 아님
```

Storybook은 **Foundations / Components / Patterns / Customization** 순서로 구성합니다.
`stories/**/*.stories.tsx`에 CSF3 Story를 추가하고, 상태별 `args`·Controls·Autodocs와 동작 `play`를 함께 문서화합니다.
현재 공개 컴포넌트는 없으므로 `Components/Internal/Verification` fixture만 환경 검증용으로 제공합니다.
`Default`, `Error`, `PortalOpen`, `LongText`는 상태 확인용이고 `Interaction`은 실제 Chromium 동작 assertion을 실행합니다.

`pnpm test:storybook`은 Vitest 4 browser mode와 Playwright Chromium을 사용해 모든 Story를 렌더링하고 `play` assertion 및 addon-a11y 검사를 실행합니다.
CI에서도 같은 명령을 일회성으로 실행하며 실패 시 `.artifacts/storybook/junit.xml`과 생성된 화면·첨부 파일을 `.artifacts/storybook/{screenshots,attachments}/`에 보존합니다.
Storybook용 Vite 설정은 패키지 library build와 분리하고, Vitest에서는 StyleX runtime injection을 사용해 테스트 종료 타이머가 남지 않게 합니다.

접근성 검사 대상은 Storybook manager가 아닌 preview document의 `body`이므로 열린 Portal도 포함됩니다.
axe 위반은 `a11y.test: 'error'`로 검사 실패가 되며 `incomplete` 결과는 수동 확인 대상으로 기록합니다.
WCAG 2.2 A/AA 태그를 적용하고 문서 조각에는 `region` 규칙만 해제합니다. 이 자동 검사가 접근성 전체를 보장하지는 않습니다.

수동 시각·키보드 검토는 기본·오류·열린 Portal·긴 문구 Story를 일반 화면과 360px 좁은 화면에서 수행합니다.
200% 확대, reduced motion, Tab 순서, Enter 조작, focus 표시·복귀, 콘솔 오류·경고와 네트워크 실패를 조작 전후 화면과 함께 기록합니다.
자동 스크린샷 비교·baseline·Docker VRT·외부 시각 검사 서비스는 이슈 #17 범위에 포함하지 않습니다.

## 후속 작업

- [전체 진행과 범위 #1](https://github.com/sonsu-lee/frame-ui/issues/1)
- [Storybook·UI·접근성 검사 #3](https://github.com/sonsu-lee/frame-ui/issues/3)
- [디자인 토큰과 테마 #4](https://github.com/sonsu-lee/frame-ui/issues/4)
- [Vite·Next.js 실제 패키지 소비 검증 #7](https://github.com/sonsu-lee/frame-ui/issues/7)
