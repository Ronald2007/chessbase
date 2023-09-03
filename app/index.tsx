import { Link } from "expo-router";
import { Text } from "react-native";

export default function HomePage() {
  return (
    <>
      <Text className="text-red-500">styled text</Text>
      <Link className="text-green-500" href="/second">
        Go to second page
      </Link>
    </>
  );
}
