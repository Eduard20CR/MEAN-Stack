import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { PostModel } from '../models/posrtModel';

@Injectable({
  providedIn: 'root',
})
export class PostService {
  private postList: PostModel[] = [];
  subjectPost = new Subject<PostModel[]>();

  constructor(private http: HttpClient, private router: Router) {}

  getPostList() {
    this.http
      .get<{ message: string; posts: any[] }>('http://localhost:5000/api/posts')
      .pipe(
        map((postData): PostModel[] => {
          return postData.posts.map((post) => {
            return { id: post._id, title: post.title, content: post.content };
          });
        })
      )
      .subscribe((tranformedPosts) => {
        this.postList = tranformedPosts;
        this.nextPostSubject();
      });
  }

  getPostSubject() {
    return this.subjectPost.asObservable();
  }

  getPostById(id: string) {
    return this.http.get<{ message: string; post: any }>(
      `http://localhost:5000/api/posts/${id}`
    );
    // return { ...this.postList.find((post) => post.id === id) } as PostModel;
  }

  addPost(post: PostModel) {
    this.http
      .post<{ message: string; idPost: string }>(
        'http://localhost:5000/api/posts',
        post
      )
      .subscribe((res) => {
        post.id = res.idPost;
        this.postList.push(post);
        this.nextPostSubject();
        this.router.navigate(['/']);
      });
  }

  deletePost(idPost: string) {
    this.http
      .delete<{ message: string }>(`http://localhost:5000/api/posts/${idPost}`)
      .subscribe((res) => {
        this.postList = this.postList.filter((post) => post.id !== idPost);
        this.nextPostSubject();
      });
  }

  updatePost(id: string, postEdited: PostModel) {
    this.http
      .put<{ message: string }>(
        `http://localhost:5000/api/posts/${id}`,
        postEdited
      )
      .subscribe((res) => {
        const updatedPosts = [...this.postList];
        const indexOfUpdatedPost = updatedPosts.findIndex((p) => p.id === id);
        updatedPosts[indexOfUpdatedPost] = postEdited;
        this.postList = updatedPosts;
        this.nextPostSubject();
        this.router.navigate(['/']);
      });
  }

  nextPostSubject() {
    this.subjectPost.next([...this.postList]);
  }
}
