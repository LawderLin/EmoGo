import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs>
      {/* First tab uses the index.js screen in this folder */}
      <Tabs.Screen
        name="index"
        options={{
          title: "數據收集",
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "歷史記錄",
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "設定",
        }}
      />
    </Tabs>
  );
}
