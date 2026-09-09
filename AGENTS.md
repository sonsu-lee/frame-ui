# Frame UI 작업 지침

- 시작 전에 Git 상태와 대상 이슈를 확인하고 관계없는 변경을 보존한다.
- StyleX로 스타일을 작성한다. Base UI는 합의된 상호작용 컴포넌트에서 필요할 때 추가한다.
- 공개 컴포넌트, 디자인 토큰, Storybook과 소비 예제는 각각의 이슈 범위에서 구현한다.
- `pnpm check`로 현재 기반 설정을 검증한다. UI나 Next hydration 검증을 실행한 것으로 과장하지 않는다.
- 후속 UI 변경에서는 Story·문서·동작·axe·시각 검증을 같은 PR에 포함한다.
- 커밋 전 독립 리뷰는 `gpt-6-astra / xhigh`의 새 컨텍스트로 수행한다.
- 사용자 요청에 포함된 Git·PR 작업만 수행하고 force push·자동 merge·npm publish를 하지 않는다.
