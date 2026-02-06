import { FC, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Upload } from 'lucide-react';

interface StorageControlsProps {
  readonly onExport: () => void;
  readonly onImport: (file: File) => void;
}

export const StorageControls: FC<StorageControlsProps> = ({
  onExport,
  onImport,
}) => {
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImport(file);
      // Reset input value to allow selecting the same file again
      e.target.value = '';
    }
  };

  return (
    <div className="flex gap-2">
      <Button onClick={onExport} variant="outline" size="sm">
        <Download className="mr-2 h-4 w-4" />
        Export Tasks
      </Button>

      <div className="relative">
        <input
          type="file"
          id="import-tasks-input"
          className="hidden"
          accept=".json"
          onChange={handleFileChange}
        />
        <Button asChild variant="outline" size="sm">
          <label htmlFor="import-tasks-input" className="cursor-pointer">
            <Upload className="mr-2 h-4 w-4" />
            Import Tasks
          </label>
        </Button>
      </div>
    </div>
  );
};
