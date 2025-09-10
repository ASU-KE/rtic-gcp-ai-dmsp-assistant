import { useEffect, useState } from 'react';
import { format, parseISO } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import DataTable, { TableColumn } from 'react-data-table-component';
import { Row, Col, Spinner, Button, Modal } from 'react-bootstrap';

type Submission = {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  dmspText: string;
  llmResponse: string;
  submittedAt: string;
};

export const SubmissionsPage = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);

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
      cell: (row) => (
        <div style={{ maxWidth: 250, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {row.dmspText}
        </div>
      ),
      sortable: false,
    },
    {
      name: 'AI Response',
      cell: (row) => (
        <div style={{ maxWidth: 250, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {row.llmResponse}
        </div>
      ),
      sortable: false,
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
          <>
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
              onRowClicked={(row) => setSelectedSubmission(row)}
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

            {/* Modal for full submission view */}
            <Modal
              show={!!selectedSubmission}
              onHide={() => setSelectedSubmission(null)}
              size="xl"
              centered
            >
              <Modal.Header className="py-1" closeButton>
                <Modal.Title className="mb-0">Submission Details</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                {selectedSubmission && (
                  <div className="basic-info">
                    <p><strong>Submitted At:</strong> {format(parseISO(selectedSubmission.submittedAt), 'yyyy-MM-dd HH:mm:ss')}</p>
                    <p><strong>Email:</strong> {selectedSubmission.email}</p>
                    <p><strong>Name:</strong> {selectedSubmission.firstName} {selectedSubmission.lastName}</p>
                    <hr className="my-2" />
                    <p><strong>DMSP Text:</strong></p>
                    <div className="p-2 bg-light rounded" style={{ maxHeight: '400px', overflowY: 'auto' }}>{selectedSubmission.dmspText}</div>
                    <hr className="my-2" />
                    <p><strong>AI Response:</strong></p>
                    <div className="p-2 bg-light rounded" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {selectedSubmission.llmResponse.replace(/<EOS>$/, '').trim()}
                      </ReactMarkdown>
                    </div>
                  </div>
                )}
              </Modal.Body>
            </Modal>
          </>
        )}
      </Col>
    </Row>
  );
};
