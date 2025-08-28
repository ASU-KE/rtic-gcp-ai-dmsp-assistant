import { useEffect, useState } from 'react';
import { Table, Button, Row, Col, Spinner } from 'react-bootstrap';

type Submission = {
  id: number;
  username: string;
  dmspText: string;
  llmResponse: string;
  submittedAt: string;
};

export const SubmissionsPage = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const res = await fetch('/api/submissions');
        const result = await res.json();
        console.log("Fetched submissions:", result);
        setSubmissions(result.data.submissions || []);
      } catch (err) {
        console.error('Error fetching submissions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, []);

  return (
    <Row className="mt-4">
      <Col md={12}>
        <h2>DMSP Submissions Report</h2>
        <p className="text-muted">List of submitted DMSPs with AI analysis</p>

        <div className="mb-3">
          <Button variant="primary" onClick={() => {
            window.open("/api/submissions/export", "_blank");
          }} >
            Download Excel Report
          </Button>
        </div>

        {loading ? (
          <Spinner animation="border" />
        ) : (
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>DMSP Text</th>
                <th>AI Response</th>
                <th>Submitted At</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((sub) => (
                <tr key={sub.id}>
                  <td>{sub.id}</td>
                  <td>{sub.username}</td>
                  <td style={{ maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {sub.dmspText}
                  </td>
                  <td style={{ maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {sub.llmResponse}
                  </td>
                  <td>{sub.submittedAt}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Col>
    </Row>
  );
};
