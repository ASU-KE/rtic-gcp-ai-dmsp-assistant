import axios from 'axios';
import '../App.css';
import { useEffect, useRef, useState } from 'react';
import { Col, Row, Button } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { Atom } from 'react-loading-indicators';
import Markdown from 'react-markdown';
import useWebSocket from 'react-use-websocket';
import 'github-markdown-css/github-markdown-light.css';
import html2pdf from 'html2pdf.js';
import { DownloadIcon, CheckIcon, CopyIcon } from '../components/Icons';

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

  const lastChunkRef = useRef('');
  const contentEndRef = useRef<HTMLDivElement>(null);
  const markdownRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    clearErrors,
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

  return (
    <>
      <Row className="mb-4">
        <Col md={8}>
          <div className="mt-2">
            <h2 className="mt-2">Welcome to the ASU Data Management and Sharing Plan Response Agent!</h2>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label>Data Management Plan:</label>
            </div>
            <textarea
              {...register('dmpText', { required: 'DMP Text is required' })}
              rows={10}
              cols={100}
              onBlur={() => clearErrors('dmpText')}
            />
            <div
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.2rem' }}
            >
              <div style={{ flex: 1 }}>
                {errors.dmpText && (
                  <div style={{ color: '#8c1d40', fontSize: '0.875rem' }}>{errors.dmpText.message}</div>
                )}
              </div>
              <Button
                type="submit"
                disabled={submissionInProgress}
                className="btn-custom-medium"
                style={{ marginLeft: '1rem' }}
              >
                {showLoadingIndicator ? 'Submitting...' : submissionInProgress ? 'Submitted' : 'Submit'}
              </Button>
            </div>
          </form>
        </Col>
      </Row>

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
                <div>
                  <h5 className="m-0 fw-semibold">AI Analysis for DMP Text:</h5>
                  <div className="dmp-info-box">
                    {submittedDmpText.slice(0, 100)}
                    {submittedDmpText.length > 100 ? '...' : ''}
                  </div>
                </div>
                <div className="d-flex gap-2">
                  <Button size="sm" className="btn-custom-yellow" onClick={handleCopy}>
                    {copied ? <CheckIcon /> : <CopyIcon />}
                    {copied ? 'Copied' : 'Copy'}
                  </Button>
                  <Button size="sm" className="btn-custom-yellow" onClick={handleDownload}>
                    {downloaded ? <CheckIcon /> : <DownloadIcon />}
                    {downloaded ? 'Downloaded' : 'Download'}
                  </Button>
                </div>
              </div>

              <div ref={markdownRef} className="markdown-body">
                <Markdown>{streamedText}</Markdown>
              </div>
            </div>
          </Col>
        </Row>
      )}

      <div ref={contentEndRef} />
    </>
  );
}
