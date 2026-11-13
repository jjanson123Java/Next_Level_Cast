export function PodcastPlaceholder({ subject, catalogPreview = false }: { subject: string; catalogPreview?: boolean }) {
  return (
    <article className="podcastPlaceholder">
      <img className="episodePreview" src="/brand/next-level-cast-cover.png" alt={`${subject} podcast artwork`} width="720" height="405" />
      <div className="podcastPlaceholderCopy">
        <span className="tag">{catalogPreview ? "Category preview" : "Coming soon"}</span>
        <h3>Podcast coming soon</h3>
        <p>
          This Next Level Cast artwork marks the place for the upcoming podcast. It will be replaced by the
          complete episode when production is finished.
        </p>
      </div>
    </article>
  );
}
