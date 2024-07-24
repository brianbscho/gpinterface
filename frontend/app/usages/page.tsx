import TextUsages from "./TextUsages";
import ImageUsages from "./ImageUsages";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui";

export default function Page() {
  return (
    <Tabs defaultValue="text">
      <TabsList>
        <TabsTrigger value="text">Text</TabsTrigger>
        <TabsTrigger value="image">Image</TabsTrigger>
      </TabsList>
      <TabsContent value="text">
        <TextUsages />
      </TabsContent>
      <TabsContent value="image">
        <ImageUsages />
      </TabsContent>
    </Tabs>
  );
}
