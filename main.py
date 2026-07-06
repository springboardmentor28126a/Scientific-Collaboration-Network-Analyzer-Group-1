from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static")

templates = Jinja2Templates(directory="templates")

posts: list[dict] = [
    {
        "id": 1,
        "author": "SpringBoard",
        "title": "Scientific-Collaboration-Network-Analyzer",
        "content": "The Scientific Collaboration Network Analyzer is a research collaboration management platform designed to help universities and research organizations efficiently manage researchers, publications, institutions, projects, conferences, and research collaborations through a centralized system.",
        "date_posted": "June 29, 2026",
    },
    {
        "id": 2,
        "author": "Ayush Jhade (365)",
        "title": "Scientific-Collaboration-Network-Analyzer-Group-1, README.md",
        "content": "The Scientific Collaboration Network Analyzer is a research collaboration management platform designed to help universities and research organizations efficiently manage researchers, publications, institutions, projects, conferences, and research collaborations through a centralized system.",
        "date_posted": "July 4, 2026",
    },
]


@app.get("/", include_in_schema=False, name="home")
@app.get("/posts", include_in_schema=False, name="posts")
def home(request: Request):
    return templates.TemplateResponse(
        request,
        "home.html",
        {"posts": posts, "title": "Home"},
    )


@app.get("/api/posts")
def get_posts():
    return posts