import "./src/styles/global.css";
import { StatusBar } from 'expo-status-bar';
import { Text, View, Switch, Pressable } from 'react-native';
import { useColorScheme } from 'nativewind';
import { verifyInstallation } from 'nativewind';

export default function App() {
  const { colorScheme, toggleColorScheme } = useColorScheme();

  return (
    <View className="flex-1 items-center justify-center bg-background p-4">
      <View className="w-full max-w-sm card-3d rounded-xl p-6 mb-8">
        <Text className="text-2xl font-bold text-foreground mb-4 text-center">
          NativeWind Theme
        </Text>
        <Text className="text-muted-foreground text-center mb-6">
          This card uses the {colorScheme} theme colors.
        </Text>
        
        <View className="bg-secondary p-4 rounded-lg mb-4">
            <Text className="text-secondary-foreground font-semibold text-center">Secondary Color</Text>
        </View>

        <View className="flex-row justify-between items-center bg-muted p-3 rounded-md">
            <Text className="text-foreground">Toggle Theme</Text>
            <Switch value={colorScheme === 'dark'} onValueChange={toggleColorScheme} />
        </View>
      </View>

      <View className="gap-4 w-full max-w-sm">
          <Pressable className="btn-3d bg-primary p-4 rounded-lg items-center">
             <Text className="text-primary-foreground font-bold">Primary Button</Text>
          </Pressable>
          
          <Pressable className="bg-destructive p-4 rounded-lg items-center">
             <Text className="text-destructive-foreground font-bold">Destructive Action</Text>
          </Pressable>
      </View>

      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
    </View>
  );
}