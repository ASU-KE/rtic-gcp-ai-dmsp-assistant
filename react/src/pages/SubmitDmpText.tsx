import axios from 'axios';
import '../App.css';
import { useEffect, useRef, useState } from 'react';
import { Col, Row, Button, Form, Card, Stack, Container, Accordion } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist/legacy/build/pdf';
import workerSrc from 'pdfjs-dist/legacy/build/pdf.worker.min.mjs?url';
import { useMutation } from '@tanstack/react-query';
import { Atom } from 'react-loading-indicators';
import Markdown from 'react-markdown';
import useWebSocket from 'react-use-websocket';
import 'github-markdown-css/github-markdown-light.css';
import html2pdf from 'html2pdf.js';
import { DownloadIcon, CheckIcon, CopyIcon } from '../components/Icons';
import mammoth from 'mammoth';

GlobalWorkerOptions.workerSrc = workerSrc;

type FormValues = {
  dmpText: string;
};

export function SubmitDmpText() {
  const [submissionInProgress, setSubmissionInProgress] = useState(false);
  const [streamedText, setStreamedText] = useState<string>('');
  const [showLoadingIndicator, setShowLoadingIndicator] = useState(false);
  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [submittedDmpText, setSubmittedDmpText] = useState<string | null>(null);
  const [useTextMode, setUseTextMode] = useState(false);
  const [fileError, setFileError] = useState('');
  const [fileUploaded, setFileUploaded] = useState(false);

  const lastChunkRef = useRef('');
  const contentEndRef = useRef<HTMLDivElement>(null);
  const markdownRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    clearErrors,
    setValue,
    formState: { errors },
  } = useForm<FormValues>();

  const { lastMessage } = useWebSocket(
    import.meta.env.PROD
      ? `wss://${import.meta.env.VITE_BACKEND_DOMAIN}`
      : `ws://${import.meta.env.VITE_BACKEND_DOMAIN}:${import.meta.env.VITE_BACKEND_PORT}`,
    {
      onOpen: () => console.log('WebSocket connected'),
      onClose: () => console.log('WebSocket disconnected'),
      shouldReconnect: () => true,
    }
  );

  useEffect(() => {
    if (contentEndRef.current) {
      contentEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [streamedText]);

  useEffect(() => {
    if (lastMessage?.data) {
      try {
        const parsed = JSON.parse(lastMessage.data);
        if (parsed.chunk) {
          setShowLoadingIndicator(false);
          let chunkToAppend = parsed.chunk;
          if (chunkToAppend.includes('<EOS>')) {
            chunkToAppend = chunkToAppend.replace('<EOS>', '');
            setSubmissionInProgress(false);
          }

          if (chunkToAppend && chunkToAppend !== lastChunkRef.current) {
            setStreamedText((prev) => prev + chunkToAppend);
            lastChunkRef.current = chunkToAppend;
          }
        }
      } catch (e) {
        console.error('Invalid JSON:', lastMessage.data);
      }
    }
  }, [lastMessage]);

  const { mutate } = useMutation<void, unknown, FormValues>({
    mutationFn: (values) => {
      return axios
        .post(
          import.meta.env.PROD
            ? `https://${import.meta.env.VITE_BACKEND_DOMAIN}/dmp/text`
            : `http://${import.meta.env.VITE_BACKEND_DOMAIN}:${import.meta.env.VITE_BACKEND_PORT}/dmp/text`,
          {
            dmpText: values.dmpText,
          }
        )
        .then(() => {
          setSubmittedDmpText(values.dmpText);
        })
        .catch(() => {
          setSubmissionInProgress(false);
          setShowLoadingIndicator(false);
        });
    },
  });

  const onSubmit = (values: FormValues) => {
    if (!values.dmpText || values.dmpText.trim() === '') {
      setFileError('Please upload a valid file or enter text manually.');
      return;
    }

    setFileError('');
    setSubmissionInProgress(true);
    setShowLoadingIndicator(true);
    setStreamedText('');
    setCopied(false);
    setSubmittedDmpText(values.dmpText);
    lastChunkRef.current = '';
    mutate(values);
    reset();
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(streamedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const handleDownload = () => {
    if (markdownRef.current) {
      const clonedContent = markdownRef.current.cloneNode(true) as HTMLElement;
      clonedContent.classList.add('pdf-print');

      const opt = {
        margin: 0.5,
        filename: 'dmp-ai-analysis-report.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
      };

      html2pdf().set(opt).from(clonedContent).save();

      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 2000);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size === 0) {
      setFileError('File is empty. Please upload a valid file.');
      setFileUploaded(false);
      return;
    }

    setFileUploaded(true);

    setFileError('');
    const fileType = file.type;

    try {
      let text = '';

      if (fileType === 'application/pdf') {
        try {
          const arrayBuffer = await file.arrayBuffer();
          const pdf = await getDocument({ data: arrayBuffer }).promise;

          let content = '';
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map((item: any) => item.str).join(' ');
            content += pageText + '\n';
          }

          setValue('dmpText', content);
        } catch (error) {
          console.error('Error reading PDF:', error);
          setFileError('Failed to extract text from PDF. Please try another file.');
        }
      } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        text = result.value;
        setValue('dmpText', text);
      } else if (fileType === 'text/plain') {
        const reader = new FileReader();
        reader.onload = () => {
          const content = reader.result as string;
          setValue('dmpText', content);
        };
        reader.readAsText(file);
      } else {
        setFileError('Unsupported file type. Please upload PDF, DOCX, or TXT.');
      }
    } catch (err) {
      console.error(err);
      setFileError('Error reading file');
    }
  };

  return (
      <Container className="mt-4 mb-4">
        <Row className="mb-3">
          <h2 className="mt-2">AI Feedback Tool Beta Upload Page</h2>
          <Col md={8}>
          <p className="mt-2">
            This AI Feedback Tool has been trained to review Data Management and Sharing Plans (DMSP) according to the
            NSF's guidelines. Support for additional funding agencies will be added in the future. This tool can be
            tested by uploading a DMSP file, such as a PDF, OR by pasting the text of the plan.
          </p>
          <p className="mt-2">Click the "Choose File" button below to select and upload a DMSP file.</p>
          </Col>
          <Col md={6} className="mb-3">
            <Accordion defaultActiveKey="0">
              <Accordion.Item eventKey="0">
                <Accordion.Header>Upload a DMSP File</Accordion.Header>
                <Accordion.Body>
                  <Form.Group controlId="formFile">
                    {/* <Form.Label className="fw-semibold">Upload a PDF, MS Word, or plain text file.</Form.Label> */}
                    <Form.Control className="mt-2" type="file" accept=".pdf,.docx,.txt" onChange={handleFileUpload} />
                    <Form.Text className="text-muted">
                      Accepted formats: <strong>PDF</strong>, <strong>DOCX</strong>, or <strong>TXT</strong>
                    </Form.Text>
                    {fileError && <div className="text-danger mt-1 fw-semibold">{fileError}</div>}
                  </Form.Group>
                </Accordion.Body>
              </Accordion.Item>
              <Accordion.Item eventKey="1">
                <Accordion.Header>Paste DMSP text</Accordion.Header>
                <Accordion.Body>
                  <Form.Control
                    as="textarea"
                    rows={10}
                    {...register('dmpText', { required: 'DMP Text is required' })}
                    onBlur={() => clearErrors('dmpText')}
                  />
                  {errors.dmpText && <div className="text-danger fw-semibold">{errors.dmpText.message}</div>}
                </Accordion.Body>
              </Accordion.Item>
            </Accordion>

            <div className="d-flex justify-content-end mt-3">
              <Button
                type="submit"
                onClick={handleSubmit(onSubmit)}
                disabled={submissionInProgress}
                className="btn-custom-medium"
              >
                {showLoadingIndicator ? 'Submitting...' : submissionInProgress ? 'Submitted' : 'Submit'}
              </Button>
            </div>
          </Col>

          {showLoadingIndicator && (
            <Row className="mt-2">
              <Col md={12}>
                <div className="border p-2">
                  <div className="d-flex justify-content-center">
                    <Row>
                      <h4>Analyzing your DMP... please wait</h4>
                    </Row>
                  </div>
                  <div className="d-flex justify-content-center">
                    <Row>
                      <Atom color="#000000" size="medium" />
                    </Row>
                  </div>
                </div>
              </Col>
            </Row>
          )}

          {streamedText && submittedDmpText && (
            <Row className="mt-2 mb-4">
              <Col md={12}>
                <div className="border p-3" style={{ position: 'relative' }}>
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    {/* <div>
                  <h5 className="m-0 fw-semibold">AI Analysis for DMP Text:</h5>
                  <div className="dmp-info-box">
                    {submittedDmpText.slice(0, 100)}
                    {submittedDmpText.length > 100 ? '...' : ''}
                  </div>
                </div> */}
                    <div>
                      {/* <h5 className="m-0 fw-semibold">AI Analysis for DMP Text:</h5> */}
                      <p>
                        Thank you for using the ASU DMSP AI Feedback Tool! This AI-generated response is based on the{' '}
                        <a href="https://osf.io/mgjpp">DART Data Management Plan Rubric</a> to gauge your plan’s
                        effectiveness.{' '}
                        <strong>
                          Your feedback will be displayed below with an option to download your feedback as a PDF
                        </strong>
                        .
                      </p>
                      <p>
                        <strong>Consider this response as guidance only.</strong> As the author and investigator of your
                        project, you are ultimately responsible for the project's outcomes and adhering to your data
                        management plan. The DMPTool generated this feedback to give you a quick response so that you
                        can adapt your plan immediately.
                      </p>
                      <p>
                        <strong>If you have any questions</strong> or would like the review of your plan to be done by a
                        human, request a consultation with the{' '}
                        <a href="https://asu.service-now.com/sp?sysparm_stack=no&sys_id=fcadee6d1b1c20d09a9cca2b234bcbf3&id=sc_category">
                          Research Data Management Office
                        </a>
                        . Please allow three business days for someone to respond to your request.
                      </p>
                      <p>
                        <strong>Staff may contact you</strong> to ensure your plan is connected with the most
                        appropriate available resources. Contact the{' '}
                        <a href="https://asu.service-now.com/sp?sysparm_stack=no">Research Technology Office</a> to
                        ensure those services are available and determine if your proposal should include any costs.
                      </p>
                      <p>
                        <strong>Don’t wait for feedback on your plan before submitting your proposal.</strong> After
                        submission, you may also receive a Just in Time (JIT) request from your funder if they have
                        questions about your plan.
                      </p>
                    </div>
                    <div className="d-flex gap-2">
                      <Button
                        disabled={submissionInProgress}
                        size="sm"
                        className="btn-custom-yellow"
                        onClick={handleCopy}
                      >
                        {copied ? <CheckIcon /> : <CopyIcon />}
                        {copied ? 'Copied' : 'Copy'}
                      </Button>
                      <Button
                        disabled={submissionInProgress}
                        size="sm"
                        className="btn-custom-yellow"
                        onClick={handleDownload}
                      >
                        {downloaded ? <CheckIcon /> : <DownloadIcon />}
                        {downloaded ? 'Downloaded' : 'Download'}
                      </Button>
                    </div>
                  </div>

                  <div ref={markdownRef} className="markdown-body">
                    <Markdown>{streamedText}</Markdown>
                  </div>

                  {!submissionInProgress && (
                    <div className="d-flex justify-content-between align-items-start mt-3">
                      <div className="d-flex gap-2">
                        <Button
                          disabled={submissionInProgress}
                          size="sm"
                          className="btn-custom-yellow"
                          onClick={handleCopy}
                        >
                          {copied ? <CheckIcon /> : <CopyIcon />}
                          {copied ? 'Copied' : 'Copy'}
                        </Button>
                        <Button
                          disabled={submissionInProgress}
                          size="sm"
                          className="btn-custom-yellow"
                          onClick={handleDownload}
                        >
                          {downloaded ? <CheckIcon /> : <DownloadIcon />}
                          {downloaded ? 'Downloaded' : 'Download'}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </Col>
            </Row>
          )}

          <div ref={contentEndRef} />
        </Row>
      </Container>
  );
}
