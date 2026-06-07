import { Redirect } from 'expo-router'

// Until auth is wired, drop straight into the tab shell so screens are reachable.
export default function Index() {
  return <Redirect href="/(tabs)/calendar" />
}
