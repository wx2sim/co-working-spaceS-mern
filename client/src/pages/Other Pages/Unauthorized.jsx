import ErrorPage from './ErrorPage';

export default function Unauthorized() {
  return <ErrorPage statusCode={401} />;
}
