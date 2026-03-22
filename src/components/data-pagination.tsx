import { Button } from "@/components/ui/button";

interface Props {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}
export function DataPagination({ page, totalPages, onPageChange }: Props) {
  const handlePreviousBtnClick = () => {
    onPageChange(Math.max(1, page - 1));
  };
  const handleNextBtnClick = () => {
    onPageChange(Math.min(totalPages, page + 1));
  };
  return (
    <div className="flex items-center justify-center">
      <div className="flex-1 text-muted-foreground text-sm">
        Page {page} of {totalPages || 1}
      </div>
      <div className="flex items-center justify-end space-x-2 p-4">
        <Button
          disabled={page === 1}
          variant="outline"
          size="sm"
          onClick={handlePreviousBtnClick}
        >
          Previous
        </Button>
        <Button
          disabled={page === totalPages || totalPages === 0}
          variant="outline"
          size="sm"
          onClick={handleNextBtnClick}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
