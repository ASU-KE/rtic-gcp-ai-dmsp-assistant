import { useEffect, useState } from 'react';
import { format, parseISO } from 'date-fns';
import DataTable, { TableColumn } from 'react-data-table-component';
import { Row, Col, Spinner, Button } from 'react-bootstrap';

type Submission = {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  dmspText: string;
  llmResponse: string;
  submittedAt: string;
};

const ExpandableCell = ({ text, expanded, lines = 3 }: { text: string; expanded: boolean; lines?: number }) => (
  <div
    style={{
      display: '-webkit-box',
      WebkitLineClamp: expanded ? 'none' : lines,
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden',
      whiteSpace: 'normal',
    }}
  >
    {text}
  </div>
);

export const SubmissionsPage = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const res = await fetch('/api/submissions');
        const result = await res.json();
        setSubmissions(result.data.submissions || []);
      } catch (err) {
        console.error('Error fetching submissions:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSubmissions();
  }, []);

  const toggleRow = (rowId: number) => {
    const newSet = new Set(expandedRows);
    if (newSet.has(rowId)) newSet.delete(rowId);
    else newSet.add(rowId);
    setExpandedRows(newSet);
  };

  const columns: TableColumn<Submission>[] = [
    {
      id: 'submittedAt',
      name: 'Submitted At',
      selector: (row) => format(parseISO(row.submittedAt), 'yyyy-MM-dd HH:mm:ss'),
      sortable: true,
      wrap: false,
    },
    {
      name: 'Email',
      selector: (row) => row.email,
      sortable: true,
      wrap: false,
    },
    {
      name: 'Name',
      selector: (row) => `${row.firstName} ${row.lastName}`,
      sortable: true,
      wrap: false,
    },
    {
      name: 'DMSP Text',
      cell: (row) => <ExpandableCell text={row.dmspText} expanded={expandedRows.has(row.id)} />,
      sortable: false,
      wrap: true,
    },
    {
      name: 'AI Response',
      cell: (row) => <ExpandableCell text={row.llmResponse} expanded={expandedRows.has(row.id)} />,
      sortable: false,
      wrap: true,
    },
  ];

  return (
    <Row className="mt-4">
      <Col md={12}>
        <h2>DMSP Submissions Report</h2>
        <p className="text-muted">List of submitted Data Management Plans with AI-generated analysis.</p>

        <div className="mb-3">
          <Button variant="primary" onClick={() => window.open('/api/submissions/export', '_blank')}>
            Download Excel Report
          </Button>
        </div>

        {loading ? (
          <Spinner animation="border" />
        ) : (
          <DataTable
            columns={columns}
            data={submissions}
            pagination
            paginationPerPage={10}
            paginationRowsPerPageOptions={[10, 25, 50, 100]}
            highlightOnHover
            responsive
            defaultSortFieldId="submittedAt"
            defaultSortAsc={false}
            onRowClicked={(row) => toggleRow(row.id)}
            customStyles={{
              rows: {
                style: {
                  cursor: 'pointer',
                },
              },
              headCells: {
                style: {
                  fontSize: '14px',
                },
              },
            }}
          />
        )}
      </Col>
    </Row>
  );
};
