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
  dmpId: string;
};

export function SubmitDmpId() {
  const [submissionInProgress, setSubmissionInProgress] = useState(false);
  const [streamedText, setStreamedText] = useState<string>('');
  const [showLoadingIndicator, setShowLoadingIndicator] = useState(false);
  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [submittedDmpId, setSubmittedDmpId] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const lastChunkRef = useRef('');
  const contentEndRef = useRef<HTMLDivElement>(null);
  const markdownRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    clearErrors,
    setValue,
  } = useForm<FormValues>({ mode: 'onSubmit' });

  const { lastMessage } = useWebSocket(import.meta.env.PROD ? `wss://${import.meta.env.VITE_BACKEND_DOMAIN}` : `ws://${import.meta.env.VITE_BACKEND_DOMAIN}:${import.meta.env.VITE_BACKEND_PORT}`, {
    onOpen: () => console.log('WebSocket connected'),
    onClose: () => console.log('WebSocket disconnected'),
    shouldReconnect: () => true,
  });

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
        .post(import.meta.env.PROD ? `https://${import.meta.env.VITE_BACKEND_DOMAIN}/dmp/id` : `http://${import.meta.env.VITE_BACKEND_DOMAIN}:${import.meta.env.VITE_BACKEND_PORT}/dmp/id`, {
          dmpId: values.dmpId,
        })
        .then(() => {
          setSubmittedDmpId(values.dmpId);
        })
        .catch(() => {
          setSubmissionInProgress(false);
          setShowLoadingIndicator(false);
          const message = 'No plan found with the provided DMP ID. Please verify and try again.';
          setApiError(message);
        });
    },
  });

  const onSubmit = (values: FormValues) => {
    setSubmissionInProgress(true);
    setShowLoadingIndicator(true);
    setStreamedText('');
    setCopied(false);
    setApiError(null);
    setSubmittedDmpId(values.dmpId);
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
      // Clone the content and apply printable style
      const clonedContent = markdownRef.current.cloneNode(true) as HTMLElement;
      clonedContent.classList.add('pdf-print');

      const opt = {
        margin: 0.5,
        filename: `dmp-report-${submittedDmpId}.pdf`,
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
            This form demonstrates a simple implementation of the DMSP AI Assistant backend service. When a valid DMP ID
            is submitted, the service will fetch that plan, extract its content, and query the AI Assistant to review
            the plan.
          </div>
          <div className="mt-2">Feel free to copy and paste one of the following DMP IDs:</div>
          <ul className="mt-2">
            <li>
              10.48321/D1R316 (
              <a href="https://dmphub.uc3prd.cdlib.net/dmps/10.48321/D1R316" target="_blank" rel="noopener noreferrer">
                View DMP
              </a>
              )
            </li>
            <li>
              10.48321/D1BK5T (
              <a href="https://dmphub.uc3prd.cdlib.net/dmps/10.48321/D1BK5T" target="_blank" rel="noopener noreferrer">
                View DMP
              </a>
              )
            </li>
          </ul>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label>Please submit DMP ID:</label>
            </div>
            <div className="d-flex gap-1 align-items-start">
              <input
                {...register('dmpId', { required: 'DMP ID is required' })}
                style={{ width: '250px' }}
                onChange={(e) => {
                  setValue('dmpId', e.target.value);
                  clearErrors('dmpId');
                  setApiError(null);
                }}
                onBlur={() => {
                  clearErrors('dmpId');
                  setApiError(null);
                }}
              />
              <Button type="submit" disabled={submissionInProgress} className="btn-custom-medium">
                {showLoadingIndicator
                  ? 'Submitting...'
                  : submissionInProgress
                    ? 'Submitted'
                    : 'Submit'}
              </Button>
            </div>
            {(errors.dmpId || apiError) && (
              <div style={{ color: '#8c1d40', fontSize: '0.875rem', marginTop: '0.20rem' }}>
                {errors.dmpId?.message || apiError}
              </div>
            )}
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

      {streamedText && submittedDmpId && (
        <Row className="mt-2 mb-4">
          <Col md={12}>
            <div className="border p-3" style={{ position: 'relative' }}>
              {/* Heading + buttons */}
              <div className="d-flex justify-content-between align-items-start mb-3">
                <h5 className="m-0 fw-semibold">
                  AI Analysis for DMP ID: <span className="dmp-id-tag">{submittedDmpId}</span>
                </h5>
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
