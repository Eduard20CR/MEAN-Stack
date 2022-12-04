import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { PostModel } from 'src/app/shared/models/posrtModel';
import { PostService } from 'src/app/shared/services/post.service';

@Component({
  selector: '[app-post-list]',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.scss'],
})
export class PostListComponent implements OnInit, OnDestroy {
  postList: PostModel[] = [];
  postSubject!: Subscription;
  isLoading = false;

  constructor(private postService: PostService) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.postSubject = this.postService
      .getPostSubject()
      .subscribe((postListUpdated: PostModel[]) => {
        this.postList = postListUpdated;
        this.isLoading = false;
      });
    this.postService.getPostList();
  }

  onDeletePost(idPost: string) {
    this.postService.deletePost(idPost);
  }

  ngOnDestroy(): void {
    this.postSubject.unsubscribe();
  }

  nextStep() {}
}
