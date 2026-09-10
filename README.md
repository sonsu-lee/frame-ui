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

`pnpm check`는 타입 검사와 패키지 빌드를 순서대로 실행합니다.
소스 JSX 변환과 StyleX CSS 추출은 공식 `@stylexjs/unplugin`을 적용한 Vite library build가
담당하고, 타입 선언은 TypeScript가 별도로 생성합니다.
`build/entry.ts`에서 CSS를 가져와 추출하고 타입 선언은 `src`에서만 생성하므로,
소비 앱의 타입 검사에 CSS 모듈 선언을 요구하지 않습니다.

| 명령 | 결과 |
| --- | --- |
| `pnpm typecheck` | 소스·빌드·Storybook·브라우저 테스트 설정 타입 검사 |
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
pnpm test:visual                     # Docker: static build + Playwright + body axe + VRT
pnpm test:ui                         # 위 두 테스트를 순서대로 실행
```

Docker daemon이 필요하며 시각 검사는 `linux/arm64`로 실행합니다. CI도 `ubuntu-24.04-arm`을 사용합니다.
macOS나 amd64에서 직접 만든 이미지를 baseline으로 사용하지 않습니다. 처음 Docker 실행은 이미지·의존성 다운로드가 필요합니다.
호스트 node_modules와 worktree의 `.git`은 컨테이너에 넣지 않고, 호스트에서 읽은 HEAD/dirty 상태를 증거에 전달합니다.
개발 Storybook과 패키지 Vite library build는 설정을 분리하며 StyleX는 `viteFinal`에서 개발·빌드·Vitest에 적용합니다.
Vitest는 StyleX 0.19 Vite adapter의 HTTP 서버 종료 타이머를 피하도록 공식 Rollup 변환과 runtime CSS injection을 사용합니다.
개발/정적 Storybook은 Vite adapter를 사용하며 패키지의 CSS 추출·runtimeInjection 설정은 바꾸지 않습니다.

| 고정 항목 | 값 |
| --- | --- |
| Storybook와 React/Vite·docs·Vitest·a11y addon | 10.6.0 |
| Vitest / browser-playwright | 4.1.11 (addon의 Vitest 3/4 peer 범위) |
| Playwright / @playwright/test | 1.63.0 |
| axe-core / @axe-core/playwright | 4.13.0 |
| 폰트 | @fontsource/noto-sans-kr 5.3.0, 로컬 400/600 |
| 시각 실행 환경 | Dockerfile.visual의 digest 고정 Noble ARM64, Node 24.21.0, pnpm 12.3.4 |
| 화면·상태 | 1280×800 / 360×800, DPR 1, light, ko-KR, Asia/Tokyo, reduced motion |

버전 변경 시 peer compatibility와 frozen install, 브라우저/이미지 버전 일치 및 baseline을 다시 검증합니다.
`pnpm-workspace.yaml`은 실제 설치에 필요한 esbuild 빌드만 허용합니다.

Storybook은 **Foundations / Components / Patterns / Customization** 순서로 구성합니다.
`stories/**/*.stories.tsx`가 등록 범위입니다. 공개 컴포넌트를 추가할 때 Story도 여기에 작성하거나 main.ts의 범위를 명시적으로 확장합니다.
상태별 args·Controls·Autodocs와 play 작성 규칙은 Components/Authoring을 따릅니다.
Default·Error·PortalOpen·LongText는 자동 play가 없고, Interaction만 Vitest 동작을 실행합니다.
시각 검사는 새 Default를 연 뒤 초기 상태와 폰트를 확인하고 Playwright가 한 번 조작하여 전후를 비교합니다.

접근성은 preview **body**를 검사하여 열린 Portal을 포함합니다. manager UI는 검사에 섞이지 않습니다.
WCAG 2.2 A/AA 태그와 예외는 `.storybook/a11y.ts`가 소유합니다. `region`만 fragment의 문서 소유권 때문에 해제하며,
Storybook 내부 `.sb-wrapper`, `#storybook-docs`, `#storybook-highlights-root`만 제외합니다.
시각 검사 전용 빌드는 `VITE_FRAME_UI_A11Y_OWNER=playwright`로 addon 자동 실행을 수동 모드로 바꿔 중복 axe 실행을 피하고,
Playwright가 각 상태의 body 검사를 소유합니다. 일반 개발·정적 빌드·Vitest의 addon 검사는 자동입니다.
제품 root·Portal·대비 검사를 통째로 제외하지 않습니다. addon은 `test: error`, Playwright는 violations assertion으로 실패합니다.
axe JSON의 `incomplete`는 별도 수동 판정이 필요하며, 키보드·포커스·실제 200% 확대 검사는 자동 axe 통과와 구분합니다.

### 기준 이미지 검토와 실패 증거

일반 실행은 기준 이미지가 없거나 다르면 실패합니다. `maxDiffPixels: 0`, `threshold: 0.2`이므로
허용 색 차이 임계값을 넘은 픽셀은 하나도 허용하지 않습니다. PNG 바이트 일치 검사가 아닙니다.
초기 후보와 의도한 변경은 **대상을 선택하여** 생성하고 두 viewport의 실제 화면을 검토합니다.

```sh
pnpm test:visual:update -- error-transition
pnpm test:visual:update -- portal-transition
pnpm test:visual:update -- long-text
pnpm test:visual # 검토한 후보를 비교 모드로 재검증
```

대상 생략·알 수 없는 대상·CI에서의 갱신은 거부합니다. 생성만으로 승인된 것은 아닙니다.
`tests/visual/__screenshots__`의 전후 화면, 오류·Portal·긴 문구·좁은 화면을 확인하고 PR에 검토 결과를 기록합니다.
첫 baseline은 로컬 ARM64 검토·반복 비교 후 실제 CI 비교 결과까지 확인해야 합니다. 커밋/푸시 전에는 CI를 `not_run`으로 기록합니다.

`.artifacts/visual`에는 HTML/JSON report, 실제·기대·diff 이미지, 실패 trace, 콘솔 warning/error·pageerror·요청/HTTP 실패,
상태별 axe 결과(incomplete 포함), 환경 정보가 저장됩니다. 컨테이너 종료 뒤에도 호스트에 남습니다.
비교 실패에서 기대·실제·diff를 확인하고 `pnpm exec playwright show-report .artifacts/visual/report`로 읽습니다.
검사 결과는 다음 실행에서 교체되므로 공유할 증거는 실행별로 복사해 보존합니다. CI는 실패 artifacts를 14일 보존합니다.
Story 테스트는 `.artifacts/storybook/junit.xml`에 assertion/axe 실패를 남깁니다.

검사 자체의 실패 연결을 다시 검증하려면 아래 변경을 **각각 임시 적용**하고 종료 코드 1과 해당 원인을 확인한 뒤 복구합니다.

- Interaction의 기대 저장 메시지 변경 → `pnpm test:storybook`에서 assertion 실패.
- fixture의 Portal 안에 이름 없는 `<button type="button" />` 추가 → PortalOpen/Interaction에서 `button-name` axe 실패.
- fixture의 heading 색상 변경 → `pnpm test:visual -- error-transition`에서 스크린샷 diff 실패.

복구 후 `pnpm check`, `pnpm test:storybook`, `pnpm test:visual`이 다시 통과해야 합니다.

## 후속 작업

- [전체 진행과 범위 #1](https://github.com/sonsu-lee/frame-ui/issues/1)
- [Storybook·UI·접근성 검사 #3](https://github.com/sonsu-lee/frame-ui/issues/3)
- [디자인 토큰과 테마 #4](https://github.com/sonsu-lee/frame-ui/issues/4)
- [Vite·Next.js 실제 패키지 소비 검증 #7](https://github.com/sonsu-lee/frame-ui/issues/7)
