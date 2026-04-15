import ErrorPage from './ErrorPage';

export default function ServerError() {
  return <ErrorPage statusCode={500} />;
}
