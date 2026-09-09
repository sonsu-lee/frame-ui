# Frame UI

React와 StyleX로 만드는 기본 UI 라이브러리입니다.

현재는 **패키지 기반 설정 단계**입니다. 공개 컴포넌트와 디자인 토큰은 아직 없으며,
Storybook과 실제 Vite·Next.js 소비 예제는 후속 이슈에서 추가합니다.

## 개발 환경

- 개발용 Node.js 버전은 `.node-version`의 `22.23.2`로 고정합니다. 지원 최소 버전은 22.12이며 CI에서는 22.23.2와 24.21.0을 검사합니다.
- pnpm 12.3.4 (`packageManager`에 고정)
- React 19, TypeScript 7, StyleX 0.19, Vite 8

`@types/node`는 지원하는 Node 22 계열의 최신 버전을 사용합니다. `unplugin`은
`@stylexjs/unplugin`의 peer 요구사항에 맞는 2.x 계열의 최신 버전을 사용합니다.

CI는 [Delino Nodeup](https://github.com/delinoio/oss/tree/main/apps/nodeup-docs) 0.2.0으로
Node.js를 설치하고, `packageManager`에 고정한 pnpm을 실행합니다.
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
| `pnpm typecheck` | 소스·빌드 진입점·Vite 설정 타입 검사 |
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

현재 CSS에는 레이어 선언만 있습니다. 원본 디자인 토큰과 컴포넌트 스타일은 후속 이슈에서
추가합니다. React·ReactDOM·StyleX는 peer dependency로 두고 번들에 포함하지 않습니다.
Tailwind는 사용하지 않습니다.

컴포넌트 진입점의 출력에는 `"use client"`를 유지합니다. 향후 서버에서 읽을 토큰 메타데이터를
추가할 때는 이 client 진입점과 분리해야 합니다. Next.js SSR·hydration 전체 호환성은
후속 이슈 #7에서 검증합니다.

실제 패키지 소비와 브라우저 검증은 아래 후속 이슈에서 진행합니다.

## 후속 작업

- [전체 진행과 범위 #1](https://github.com/sonsu-lee/frame-ui/issues/1)
- [Storybook·UI·접근성 검사 #3](https://github.com/sonsu-lee/frame-ui/issues/3)
- [디자인 토큰과 테마 #4](https://github.com/sonsu-lee/frame-ui/issues/4)
- [Vite·Next.js 실제 패키지 소비 검증 #7](https://github.com/sonsu-lee/frame-ui/issues/7)

디자인 이식의 참고 원본은
[quasar-ui-sellmate-ui-kit](https://www.npmjs.com/package/quasar-ui-sellmate-ui-kit)입니다.
현재 기반 설정에는 원본의 코드·디자인 자산을 복사하지 않았습니다.
이후 이식 시 재사용한 내용의 출처와 라이선스 고지를 함께 보존합니다.
