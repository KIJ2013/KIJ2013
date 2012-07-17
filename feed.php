<?php
$feeds = array(
    'news.rss' => array(
        'name' => "Kent International Jamboree 2013 &#187; Latest news",
        'content-type' => "application/rss+xml",
        'url' => "http://www.kij13.org.uk/category/latest-news/feed/")
);
if($_GET['f'] && isset($feeds[$_GET['f']]))
{
    $feed = $feeds[$_GET['f']];
    header("Content-Type:" . $feed['content-type']);
    echo file_get_contents($feed['url']);
}
else
{
?>
<h1>KIJ2013 Feed Proxy</h1>
<p>This proxy is designed for local circumvention of cross origin requests</p>
<ul>
<?
    foreach ($feeds as $key => $feed)
    {
        echo '<li><a href="?f=' . $key . '">' . $feed['name'];
    }
}