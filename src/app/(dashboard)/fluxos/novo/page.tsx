import { FlowEditor } from "@/components/fluxos/flow-editor";

export default function NovoFluxoPage() {
  return (
    <div className="h-full flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Novo Fluxo</h1>
      </div>
      <FlowEditor />
    </div>
  );
}
