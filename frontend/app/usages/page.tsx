import { Tabs } from "@radix-ui/themes";
import TextUsages from "./TextUsages";
import ImageUsages from "./ImageUsages";

export default function Page() {
  return (
    <Tabs.Root defaultValue="text">
      <Tabs.List>
        <Tabs.Trigger value="text">Text</Tabs.Trigger>
        <Tabs.Trigger value="image">Image</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="text">
        <TextUsages />
      </Tabs.Content>
      <Tabs.Content value="image">
        <ImageUsages />
      </Tabs.Content>
    </Tabs.Root>
  );
}
