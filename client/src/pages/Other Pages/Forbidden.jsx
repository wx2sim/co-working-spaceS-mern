import ErrorPage from './ErrorPage';

export default function Forbidden() {
  return <ErrorPage statusCode={403} />;
}
