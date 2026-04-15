import ErrorPage from './ErrorPage';

export default function ServiceUnavailable() {
  return <ErrorPage statusCode={503} />;
}
