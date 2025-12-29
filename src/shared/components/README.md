# MainContainer Component

A reusable container component that provides consistent layout across all screens in the app.

## Features

- **Theme-aware background**: Automatically uses the `bg-background` color from your theme
- **Scrollable or static**: Toggle between ScrollView and View
- **Configurable padding**: Enable/disable default padding
- **Content centering**: Center content vertically when needed
- **Custom styling**: Add additional className or style props
- **TypeScript support**: Full type safety with detailed prop types

## Usage

### Basic Usage (Scrollable with padding)

```tsx
import { MainContainer } from '../../shared/components';

export default function MyScreen() {
  return (
    <MainContainer>
      <Text>Your content here</Text>
    </MainContainer>
  );
}
```

### Static Container (Non-scrollable)

```tsx
<MainContainer scrollable={false}>
  <Text>Static content that doesn't scroll</Text>
</MainContainer>
```

### Centered Content

```tsx
<MainContainer centerContent>
  <Text>This content is vertically centered</Text>
</MainContainer>
```

### Without Default Padding

```tsx
<MainContainer withPadding={false}>
  <Text>Full-width content without padding</Text>
</MainContainer>
```

### Custom Styling

```tsx
<MainContainer className="bg-primary">
  <Text>Custom background color</Text>
</MainContainer>
```

### Combining Options

```tsx
<MainContainer 
  scrollable={false} 
  centerContent 
  withPadding={false}
  className="bg-gradient-to-b from-primary to-secondary"
>
  <Text>Fully customized container</Text>
</MainContainer>
```

### With ScrollView Props

```tsx
<MainContainer 
  scrollViewProps={{
    showsVerticalScrollIndicator: false,
    refreshControl: <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
  }}
>
  <Text>Content with custom scroll behavior</Text>
</MainContainer>
```

## Migration Example

### Before (Old Pattern)

```tsx
export default function SignInScreen() {
  return (
    <ScrollView className="flex-1 bg-background">
      <View className="flex-1 p-6 justify-center min-h-screen">
        {/* Your content */}
      </View>
    </ScrollView>
  );
}
```

### After (Using MainContainer)

```tsx
import { MainContainer } from '../../shared/components';

export default function SignInScreen() {
  return (
    <MainContainer centerContent>
      {/* Your content - same as before */}
    </MainContainer>
  );
}
```

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `React.ReactNode` | **required** | Content to render inside the container |
| `scrollable` | `boolean` | `true` | Whether to use ScrollView or regular View |
| `className` | `string` | `''` | Additional NativeWind classes for styling |
| `withPadding` | `boolean` | `true` | Whether to add default padding (p-6) |
| `centerContent` | `boolean` | `false` | Whether to center content vertically |
| `scrollViewProps` | `Partial<ScrollViewProps>` | `undefined` | Additional props for ScrollView (only when scrollable=true) |
| `style` | `ViewStyle` | `undefined` | Additional inline styles |

## Benefits

1. **Consistency**: All screens use the same base layout
2. **Maintainability**: Change layout behavior in one place
3. **Flexibility**: Highly configurable for different use cases
4. **Type Safety**: Full TypeScript support with IntelliSense
5. **Theme Support**: Automatically inherits theme colors
6. **Clean Code**: Reduces boilerplate in screen components
