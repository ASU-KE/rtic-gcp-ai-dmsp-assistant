import axios, { AxiosError } from 'axios';
import { useEffect, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { Atom } from 'react-loading-indicators';
import Markdown from 'react-markdown';
import 'github-markdown-css/github-markdown-light.css';

interface ApiResponse {
  statusCode: number;
  statusMessage: string | null;
  analysis?: string | null;
  metadata?: unknown | null;
}

type FormValues = {
  dmpText: string;
};

export function SubmitDmpText() {
  const [isLoading, setIsLoading] = useState(false);
  const [isDisableSubmit, setDisableSubmit] = useState(false);
  const [apiResponse, setApiResponse] = useState<ApiResponse | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState,
  } = useForm<FormValues>();

  const { mutate } = useMutation<void, unknown, FormValues>({
    mutationFn: (values) => {
      setIsLoading(true);
      return axios.post(import.meta.env.VITE_BACKEND_URL + '/dmp/text', {
        dmpText: values.dmpText,
      })
      .then((response) => {
        setApiResponse({
          statusCode: 200,
          statusMessage: null,
          ...response.data.data,
        });
      })
      .catch((error: unknown) => {
        if (axios.isAxiosError(error)) {
          if (error.response) {
            setApiResponse({
              statusCode: error.response.status,
              statusMessage: error.response.data.error?.message || 'An error occurred',
              analysis: null,
              metadata: null,
            });
          } else if (error.request) {
            setApiResponse({
              statusCode: 0,
              statusMessage: 'No response received from server',
              analysis: null,
              metadata: null,
            });
          }
        } else {
          setApiResponse({
            statusCode: 0,
            statusMessage: 'An unexpected error occurred',
            analysis: null,
            metadata: null,
          });
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
    },
  });

  useEffect(() => {
    if (formState.isSubmitSuccessful) {
      setDisableSubmit(true);
    }
  }, [formState, reset]);

  return (
    <>
      <Row className="mb-4">
        <Col md={8}>
          <form
            onSubmit={handleSubmit((values) =>
              mutate(values, { onSuccess: () => reset() })
            )}
          >
            <div>
              <label>Data Management Plan:</label>
            </div>
            <textarea {...register('dmpText')} rows={10} cols={120} />
            <input type="submit" disabled={isDisableSubmit} />
          </form>
        </Col>
      </Row>
      {isLoading && (
        <Row className="mt-2">
          <Col md={12}>
            <div className="border p-2">
              <div className="d-flex justify-content-center">
                <Row>
                  <h3>Thank you for your patience...</h3>
                </Row>
              </div>
              <div className="d-flex justify-content-center">
                <Row>
                  <Atom color="#000000" size="medium" text="" textColor="" />
                </Row>
              </div>
            </div>
          </Col>
        </Row>
      )}
      {!isLoading && apiResponse && apiResponse.statusCode === 200 && (
        <Row className="mt-2 mb-4">
          <Col md={12}>
            <div className="border p-2 markdown-body">
              <Markdown>{apiResponse?.analysis || ''}</Markdown>
            </div>
          </Col>
        </Row>
      )}
      {!isLoading && apiResponse && apiResponse.statusCode !== 200 && (
        <Row className="mt-2">
          <Col md={12}>
            <div className="border p-2">
              <h2>Error</h2>
              <p>{apiResponse?.statusMessage}</p>
            </div>
          </Col>
        </Row>
      )}
    </>
  );
}
