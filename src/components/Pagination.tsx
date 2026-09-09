import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useI18n } from '../i18n';

interface PaginationProps {
  page: number;          // page courante, 1-indexée
  pageCount: number;
  total: number;
  perPage: number;
  onChange: (page: number) => void;
}

/** Construit la suite de pages avec ellipses : 1 … 4 5 6 … 12 */
function buildPages(page: number, pageCount: number): (number | 'gap')[] {
  if (pageCount <= 7) return Array.from({ length: pageCount }, (_, i) => i + 1);
  const out: (number | 'gap')[] = [1];
  const from = Math.max(2, page - 1);
  const to = Math.min(pageCount - 1, page + 1);
  if (from > 2) out.push('gap');
  for (let p = from; p <= to; p += 1) out.push(p);
  if (to < pageCount - 1) out.push('gap');
  out.push(pageCount);
  return out;
}

export default function Pagination({ page, pageCount, total, perPage, onChange }: PaginationProps) {
  const { t } = useI18n();
  if (pageCount <= 1) return null;

  const first = (page - 1) * perPage + 1;
  const last = Math.min(page * perPage, total);

  return (
    <nav className="pager" aria-label={t('shop.pagination')}>
      <div className="pager-pages">
        <button
          type="button"
          className="page-btn"
          onClick={() => onChange(page - 1)}
          disabled={page === 1}
          aria-label={t('shop.prevPage')}
        >
          <ChevronLeft size={18} strokeWidth={2} />
        </button>

        {buildPages(page, pageCount).map((entry, i) =>
          entry === 'gap' ? (
            <span key={`gap-${i}`} className="page-gap">…</span>
          ) : (
            <button
              key={entry}
              type="button"
              className="page-btn"
              aria-current={entry === page ? 'page' : undefined}
              onClick={() => onChange(entry)}
            >
              {entry}
            </button>
          ),
        )}

        <button
          type="button"
          className="page-btn"
          onClick={() => onChange(page + 1)}
          disabled={page === pageCount}
          aria-label={t('shop.nextPage')}
        >
          <ChevronRight size={18} strokeWidth={2} />
        </button>
      </div>

      <p className="pager-info">{t('shop.showing', { first, last, total })}</p>
    </nav>
  );
}
