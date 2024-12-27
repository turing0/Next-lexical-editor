import LexicalEditor from "@/components/editor/LexicalEditor";
import { ModeToggle } from "@/components/shared-components/ModeToggle";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="container max-w-5xl mx-auto h-full px-0 md:px-20 relative"> {/* Added relative here */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between max-sm:px-2">
        <div className="flex-1 w-full">
          <LexicalEditor
            SavelocalStorage={true}
            loadFromLocalStorage={true}
          />
        </div>
        <div className="md:sticky md:top-6 md:ml-6 self-start px-2 md:px-0">
          <Button className="rounded-3xl h-7 mb-20">
            PUBLISH
          </Button>
        </div>
      </div>
    </div>
  );
}
